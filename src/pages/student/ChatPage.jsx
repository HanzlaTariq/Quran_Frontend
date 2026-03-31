import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Button, Avatar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowBack } from '@mui/icons-material';
import StudentChat from '../../components/Chat/StudentChat';

const StudentChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
    } else {
      fetchActiveEnrollment();
    }
  }, [conversationId]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      // For now, assume conversationId is passed, fetch details if needed
      // Since we don't have endpoint, set basic
      setConversation({ _id: conversationId });
      // Fetch teacher from somewhere, but for now, assume from sidebar
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveEnrollment = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/students/enroll/my-enrollments');
      const approved = response.data.enrollments.find(e => e.status === 'approved');
      if (approved) {
        setConversation({ _id: approved.ulma.conversationId });
        setTeacher(approved.ulma.user);
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!conversation) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Conversation Found
          </Typography>
          <Typography color="textSecondary" paragraph>
            Unable to load the chat conversation.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/student/dashboard')}>
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/student/dashboard')}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Avatar sx={{ mr: 2 }}>
            {teacher?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">
              Chat with {teacher?.name || 'Teacher'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {teacher?.email}
            </Typography>
          </Box>
        </Box>

        <StudentChat
          conversationId={conversation._id}
          ulma={teacher}
        />
      </Paper>
    </Container>
  );
};

export default StudentChatPage;