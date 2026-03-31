import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Alert,
  Snackbar,
  IconButton,
  Divider,
  LinearProgress,
} from '@mui/material';
import { Close, MenuBook, ContentCopy, Videocam, VideocamOff, Mic, MicOff } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import QuranViewer from '../../components/Quran/QuranViewer';
import { connectSocket } from '../../socket/socket';

const iceConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const formatLocalDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getMediaPermissionState = async (name) => {
  try {
    if (!navigator.permissions?.query) return 'prompt';
    const result = await navigator.permissions.query({ name });
    return result.state;
  } catch (error) {
    return 'prompt';
  }
};

const LiveClass = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [classData, setClassData] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [showQuran, setShowQuran] = useState(true);
  const [quranSettings, setQuranSettings] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [mediaError, setMediaError] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const participantSocketsRef = useRef([]);
  const joinedRef = useRef(false);
  const localStreamRef = useRef(null);

  const localTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time',
    []
  );

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  useEffect(() => {
    if (user?._id) {
      fetchQuranSettings();
    }
  }, [user?._id]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    joinedRef.current = isJoined;
  }, [isJoined]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!user?._id || !classId) return;

    const socket = connectSocket({
      userId: user._id,
      role: 'student',
      classId,
    });

    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit('join-room', { classId });
    };

    const onRoomParticipants = (payload) => {
      const list = Array.isArray(payload) ? payload : payload?.participants || [];
      participantSocketsRef.current = list
        .map((item) => item?.socketId || item)
        .filter(Boolean);
    };

    const onParticipantJoined = async ({ socketId }) => {
      if (!socketId || socketId === socket.id) return;
      participantSocketsRef.current = [...participantSocketsRef.current.filter((id) => id !== socketId), socketId];
      if (joinedRef.current) {
        socket.emit('webrtc-request-offer', { targetSocketId: socketId });
      }
    };

    const onParticipantLeft = ({ socketId }) => {
      participantSocketsRef.current = participantSocketsRef.current.filter((id) => id !== socketId);
      const pc = peerConnectionsRef.current[socketId];
      if (pc) {
        pc.close();
        delete peerConnectionsRef.current[socketId];
      }
      setRemoteStream(null);
    };

    const onOffer = async ({ offer, fromSocketId }) => {
      if (!offer || !fromSocketId) return;
      if (!joinedRef.current) {
        const ok = await startLocalMedia();
        if (!ok) {
          showAlert('Joined without camera/microphone. You can still receive teacher video/audio.', 'info');
        }
        setIsJoined(true);
      }

      try {
        const pc = getOrCreatePeerConnection(fromSocketId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          targetSocketId: fromSocketId,
          answer,
        });
      } catch (error) {
        console.error('Error handling offer:', error);
        showAlert('Failed to negotiate call. Please rejoin call.', 'error');
      }
    };

    const onAnswer = async ({ answer, fromSocketId }) => {
      if (!answer || !fromSocketId) return;
      const pc = peerConnectionsRef.current[fromSocketId];
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    };

    const onIceCandidate = async ({ candidate, fromSocketId }) => {
      if (!candidate || !fromSocketId) return;
      const pc = peerConnectionsRef.current[fromSocketId];
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('ICE add error:', error);
      }
    };

    socket.on('connect', joinRoom);
    socket.on('room-participants', onRoomParticipants);
    socket.on('participant-joined', onParticipantJoined);
    socket.on('participant-left', onParticipantLeft);
    socket.on('webrtc-offer', onOffer);
    socket.on('webrtc-answer', onAnswer);
    socket.on('webrtc-ice-candidate', onIceCandidate);

    if (socket.connected) {
      joinRoom();
    }

    return () => {
      socket.off('connect', joinRoom);
      socket.off('room-participants', onRoomParticipants);
      socket.off('participant-joined', onParticipantJoined);
      socket.off('participant-left', onParticipantLeft);
      socket.off('webrtc-offer', onOffer);
      socket.off('webrtc-answer', onAnswer);
      socket.off('webrtc-ice-candidate', onIceCandidate);
      cleanupMedia();
      socket.disconnect();
    };
  }, [user?._id, classId]);

  const fetchClassData = async () => {
    if (!classId) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`/api/students/classes/${classId}`);
      const cls = data?.class || data;
      setClassData(cls);
      setMeetingLink(cls?.meetingLink || '');
    } catch (error) {
      console.error('Error fetching class data:', error);
      showAlert(error?.response?.data?.message || 'Failed to load class data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuranSettings = async () => {
    try {
      const { data } = await axios.get(`/api/quran/settings/${user._id}`);
      setQuranSettings(data);
      const panelEnabled = data?.readingMode?.showArabic !== false;
      setShowQuran(panelEnabled);
    } catch (error) {
      console.error('Error fetching Quran settings:', error);
      setShowQuran(true);
    }
  };

  const showAlert = (message, severity = 'info') => {
    setAlert({ open: true, message, severity });
  };

  const copyMeetingLink = async () => {
    if (!meetingLink) return;
    try {
      await navigator.clipboard.writeText(meetingLink);
      showAlert('Meeting link copied', 'success');
    } catch (error) {
      showAlert('Unable to copy meeting link', 'error');
    }
  };

  const startLocalMedia = async () => {
    if (localStreamRef.current) return true;

    setMediaError('');
    const permissionHelp = 'Permission denied. Browser address bar lock icon -> Site settings -> Allow Camera and Microphone, then reload and click Join Call.';

    const [cameraState, micState] = await Promise.all([
      getMediaPermissionState('camera'),
      getMediaPermissionState('microphone'),
    ]);

    if (cameraState === 'denied' && micState === 'denied') {
      setMediaError(permissionHelp);
      showAlert(permissionHelp, 'error');
      return false;
    }

    const attempts = [
      { video: true, audio: true, label: 'camera and microphone' },
      { video: true, audio: false, label: 'camera only' },
      { video: false, audio: true, label: 'microphone only' },
    ];

    for (const attempt of attempts) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: attempt.video,
          audio: attempt.audio,
        });

        const hasVideo = stream.getVideoTracks().length > 0;
        const hasAudio = stream.getAudioTracks().length > 0;

        setLocalStream(stream);
        localStreamRef.current = stream;
        setIsCameraOn(hasVideo);
        setIsMicOn(hasAudio);

        if (!(hasVideo && hasAudio)) {
          showAlert(`Connected with ${attempt.label}. You can still join the class.`, 'info');
        }

        return true;
      } catch (error) {
        const isPermissionError = error?.name === 'NotAllowedError';
        if (!isPermissionError) {
          console.error(`Media attempt failed (${attempt.label}):`, error);
        }
      }
    }

    setMediaError(permissionHelp);
    showAlert(permissionHelp, 'error');
    return false;
  };

  const getOrCreatePeerConnection = (targetSocketId) => {
    const existing = peerConnectionsRef.current[targetSocketId];
    if (existing) return existing;

    const pc = new RTCPeerConnection(iceConfig);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    } else {
      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.addTransceiver('audio', { direction: 'recvonly' });
    }

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        setRemoteStream(stream);
      }
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate || !socketRef.current) return;
      socketRef.current.emit('webrtc-ice-candidate', {
        targetSocketId,
        candidate: event.candidate,
      });
    };

    peerConnectionsRef.current[targetSocketId] = pc;
    return pc;
  };

  const createOffer = async (targetSocketId) => {
    const pc = getOrCreatePeerConnection(targetSocketId);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current?.emit('webrtc-offer', {
        targetSocketId,
        offer,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      showAlert('Failed to start call negotiation.', 'error');
    }
  };

  const renegotiateWithPeer = async (targetSocketId) => {
    const pc = peerConnectionsRef.current[targetSocketId];
    if (!pc) return;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('webrtc-offer', {
        targetSocketId,
        offer,
      });
    } catch (error) {
      console.error('Renegotiation error:', error);
    }
  };

  const enableMicrophone = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const newAudioTrack = micStream.getAudioTracks()[0];
      if (!newAudioTrack) {
        showAlert('Microphone track could not be created.', 'error');
        return;
      }

      let workingStream = localStreamRef.current;
      if (!workingStream) {
        workingStream = new MediaStream();
      }

      const existingAudio = workingStream.getAudioTracks()[0];
      if (existingAudio) {
        existingAudio.stop();
        workingStream.removeTrack(existingAudio);
      }
      workingStream.addTrack(newAudioTrack);

      localStreamRef.current = workingStream;
      setLocalStream(workingStream);
      setIsMicOn(true);

      const entries = Object.entries(peerConnectionsRef.current);
      for (const [socketId, pc] of entries) {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'audio');
        if (sender) {
          await sender.replaceTrack(newAudioTrack);
        } else {
          pc.addTrack(newAudioTrack, workingStream);
        }
        await renegotiateWithPeer(socketId);
      }

      showAlert('Microphone enabled', 'success');
    } catch (error) {
      console.error('Enable microphone error:', error);
      showAlert('Unable to enable microphone. Check browser permissions.', 'error');
    }
  };

  const joinCall = async () => {
    const ok = await startLocalMedia();
    if (!ok) {
      showAlert('Joining without camera/microphone access.', 'info');
    }

    setIsJoined(true);
    // Student requests teacher offer to avoid negotiation deadlock.
    const peers = participantSocketsRef.current || [];
    for (const socketId of peers) {
      if (socketId && socketId !== socketRef.current?.id) {
        socketRef.current?.emit('webrtc-request-offer', { targetSocketId: socketId });
      }
    }
  };

  const joinWithoutMedia = async () => {
    if (isJoined) return;
    setMediaError('');
    setIsJoined(true);
    // Student remains answer-only and requests teacher offer.
    const peers = participantSocketsRef.current || [];
    for (const socketId of peers) {
      if (socketId && socketId !== socketRef.current?.id) {
        socketRef.current?.emit('webrtc-request-offer', { targetSocketId: socketId });
      }
    }
  };

  const toggleCamera = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) {
      showAlert('Camera track not available', 'info');
      return;
    }
    const next = !isCameraOn;
    videoTrack.enabled = next;
    setIsCameraOn(next);
  };

  const toggleMic = () => {
    if (!localStream) {
      enableMicrophone();
      return;
    }
    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) {
      enableMicrophone();
      return;
    }
    const next = !isMicOn;
    audioTrack.enabled = next;
    setIsMicOn(next);
  };

  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    Object.values(peerConnectionsRef.current).forEach((pc) => {
      try {
        pc.close();
      } catch (error) {
        console.error('Peer close error:', error);
      }
    });

    peerConnectionsRef.current = {};
    setRemoteStream(null);
    setIsJoined(false);
    joinedRef.current = false;
  };

  const handleCloseAlert = () => {
    setAlert({ open: false, message: '', severity: 'info' });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Preparing live class...
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </Paper>
      </Container>
    );
  }

  if (!classId) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Select a class from your dashboard
          </Typography>
          <Button variant="contained" onClick={() => navigate('/student/dashboard')} sx={{ mt: 1.5 }}>
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  const ulmaName = classData?.ulma?.user?.name || 'Ulma';
  const courseName = classData?.course?.name || classData?.course || 'Live Class';
  const isQuranPanelEnabled = quranSettings?.readingMode?.showArabic !== false;

  return (
    <Container
      maxWidth={false}
      sx={{
        px: { xs: 1, md: 2 },
        py: 1.5,
        height: 'calc(100vh - 16px)',
        background: 'linear-gradient(160deg, #f7fafc 0%, #eef3f9 45%, #e9f5f0 100%)',
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          gridTemplateColumns: showQuran ? 'minmax(0, 1.8fr) minmax(320px, 1fr)' : '1fr',
          gap: 1.5,
          overflowX: 'auto',
        }}
      >
        <Box sx={{ minWidth: 0, height: '100%' }}>
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'rgba(255,255,255,0.7)',
              boxShadow: '0 18px 40px rgba(20, 33, 61, 0.12)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h6">{courseName}</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                    <Chip size="small" label={`Teacher: ${ulmaName}`} color="primary" variant="outlined" />
                    <Chip size="small" label={`Status: ${classData?.status || 'ongoing'}`} />
                    <Chip size="small" label={`Timezone: ${localTimezone}`} />
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1}>
                  <IconButton
                    onClick={() => setShowQuran((prev) => !prev)}
                    disabled={!isQuranPanelEnabled}
                  >
                    <MenuBook />
                  </IconButton>
                  <IconButton onClick={() => navigate('/student/dashboard')}>
                    <Close />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Start: {formatLocalDateTime(classData?.utcStart)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  End: {formatLocalDateTime(classData?.utcEnd)}
                </Typography>
                <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', sm: 'block' } }} />
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  Link: {meetingLink || 'No external link'}
                </Typography>
              </Stack>

              {!isQuranPanelEnabled && (
                <Alert
                  severity="info"
                  sx={{ mt: 1.5 }}
                  action={
                    <Button color="inherit" size="small" onClick={() => navigate('/student/settings')}>
                      Open Settings
                    </Button>
                  }
                >
                  Quran side panel is disabled in Settings (Show Arabic = Off).
                </Alert>
              )}
            </Box>

            <Box sx={{ flex: 1, bgcolor: '#0a0a0a', position: 'relative', minHeight: 0 }}>
              {!isJoined ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    textAlign: 'center',
                    color: 'white',
                  }}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Join WebRTC class call
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85, mb: 2 }}>
                      Allow camera/microphone access to connect with teacher.
                    </Typography>
                    {mediaError && (
                      <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                        {mediaError}
                      </Alert>
                    )}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">
                      <Button variant="contained" onClick={joinCall}>Join Call</Button>
                      <Button variant="outlined" onClick={joinWithoutMedia}>Join Without Camera/Mic</Button>
                    </Stack>
                  </Box>
                </Box>
              ) : (
                <>
                  {remoteStream ? (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      <Typography>Waiting for teacher to join...</Typography>
                    </Box>
                  )}

                  {localStream && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 16,
                        bottom: 16,
                        width: 220,
                        height: 140,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '2px solid rgba(255,255,255,0.9)',
                        bgcolor: 'black',
                      }}
                    >
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>

            <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopy />}
                    onClick={copyMeetingLink}
                    disabled={!meetingLink}
                  >
                    Copy Link
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={toggleCamera}
                    disabled={!isJoined || !localStream}
                    startIcon={isCameraOn ? <Videocam /> : <VideocamOff />}
                  >
                    {isCameraOn ? 'Camera On' : 'Camera Off'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={toggleMic}
                    disabled={!isJoined}
                    startIcon={isMicOn ? <Mic /> : <MicOff />}
                  >
                    {localStream?.getAudioTracks?.()?.length ? (isMicOn ? 'Mic On' : 'Mic Off') : 'Enable Mic'}
                  </Button>
                </Stack>

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    cleanupMedia();
                    navigate('/student/dashboard');
                  }}
                >
                  Leave Class
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Box>

        {showQuran && (
          <Box sx={{ minWidth: 320, height: '100%' }}>
            <Paper
              sx={{
                height: '100%',
                overflow: 'hidden',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.7)',
                boxShadow: '0 18px 40px rgba(20, 33, 61, 0.12)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <QuranViewer preferences={quranSettings} />
            </Paper>
          </Box>
        )}
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LiveClass;
