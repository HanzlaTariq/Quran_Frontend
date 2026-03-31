import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Button, Avatar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowBack } from '@mui/icons-material';
import UlmaChat from '../../components/Chat/UlmaChat';

const UlmaMessages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversation();
  }, [conversationId]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/ulma/chat/${conversationId}`);
      setConversation(response.data.conversation);
      setStudent(response.data.student);
    } catch (error) {
      console.error('Error fetching conversation:', error);
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

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/ulma/students')}
            sx={{ mr: 2 }}
          >
            Back to Students
          </Button>
          <Avatar sx={{ mr: 2 }}>
            {student?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">
              Chat with {student?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {student?.email}
            </Typography>
          </Box>
        </Box>

        {conversation && (
          <UlmaChat
            conversationId={conversation._id}
            student={student}
          />
        )}
      </Paper>
    </Container>
  );
};

export default UlmaMessages;