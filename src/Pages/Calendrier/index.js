import React, { useState, useEffect } from 'react';
import { Card, Calendar, Badge, Modal, Form, Input, TimePicker, Button, DatePicker, Typography } from 'antd';
import moment from 'moment';
import axiosInstance from '../../Middleware/axiosInstance';

const { Title, Text } = Typography;

const Calendrier = ({ cardStyle }) => {
  const [eventsData, setEventsData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: null,
    title: '',
    description: '',
    rendezvousHeureDebut: null,
    rendezvousHeureFin: null,
  });

  useEffect(() => {
    fetchRendezvousData();
  }, []);

  const fetchRendezvousData = () => {
    axiosInstance
      .get('/api/rendezvous')
      .then((response) => {
        const rendezvousData = response.data;
        const events = rendezvousData.map((rendezvous) => ({
          date: moment(rendezvous.Date).format('YYYY-MM-DD'),
          title: rendezvous.Sujet,
          description: rendezvous.Description,
          rendezvousHeureDebut: moment(rendezvous.HeureDebut, 'HH:mm:ss'),
          rendezvousHeureFin: moment(rendezvous.HeureFin, 'HH:mm:ss'),
        }));
        setEventsData(events);
      })
      .catch((error) => {
        console.error('Error fetching data from API:', error);
      });
  };

  const dateCellRender = (date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    const events = eventsData.filter((event) => event.date === formattedDate);
    const isPastDate = moment(date).isBefore(moment(), 'day');
    const cellClass = isPastDate ? 'disabled-cell' : '';

    return (
      <div className={`events ${cellClass}`}>
        {events.map((event, index) => (
          <div key={index} style={{ marginBottom: 8 }}>
            <Badge
              status="success"
              text={
                <div>
                  <Text strong>{event.title}</Text>
                  <br />
                  <Text>{`${event.rendezvousHeureDebut.format('HH:mm')} - ${event.rendezvousHeureFin.format('HH:mm')}`}</Text>
                  <br />
                  <Text type="secondary">{event.description}</Text>
                </div>
              }
            />
          </div>
        ))}
      </div>
    );
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFormSubmit = () => {
    const { date, title, description, rendezvousHeureDebut, rendezvousHeureFin } = newEvent;

    axiosInstance
      .post('/api/rendezvous', {
        Date: date.format('YYYY-MM-DD'),
        Sujet: title,
        Description: description,
        HeureDebut: rendezvousHeureDebut.format('HH:mm:ss'),
        HeureFin: rendezvousHeureFin.format('HH:mm:ss'),
      })
      .then((response) => {
        fetchRendezvousData();
        setIsModalVisible(false);
        setNewEvent({
          date: null,
          title: '',
          description: '',
          rendezvousHeureDebut: null,
          rendezvousHeureFin: null,
        });
      })
      .catch((error) => {
        console.error('Error posting new event:', error);
      });
  };

  const handleInputChange = (field, value) => {
    setNewEvent({
      ...newEvent,
      [field]: value,
    });
  };

  return (
    <Card style={{ ...cardStyle, width: '100%' }} title={<Title style={{ fontSize: '24px', fontWeight: 'bold' }}>Calendrier</Title>}>
      <Button type="primary" onClick={showModal} style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px', marginBottom: 16 }}>
        Ajouter un événement
      </Button>
      <Calendar dateCellRender={dateCellRender} />
      <Modal
        title={<Title style={{ fontSize: '24px', fontWeight: 'bold' }}>Ajouter un événement</Title>}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel} style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px' }}>
            Annuler
          </Button>,
          <Button key="submit" type="primary" onClick={handleFormSubmit} style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px' }}>
            Ajouter
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label={<Text style={{ fontSize: '16px', fontWeight: 'bold' }}>Date</Text>}>
            <DatePicker
              style={{ fontSize: '16px', width: '100%' }}
              value={newEvent.date}
              onChange={(date) => handleInputChange('date', date)}
            />
          </Form.Item>
          <Form.Item label={<Text style={{ fontSize: '16px', fontWeight: 'bold' }}>Sujet</Text>}>
            <Input
              style={{ fontSize: '16px', width: '100%' }}
              value={newEvent.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </Form.Item>
          <Form.Item label={<Text style={{ fontSize: '16px', fontWeight: 'bold' }}>Description</Text>}>
            <Input
              style={{ fontSize: '16px', width: '100%' }}
              value={newEvent.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Form.Item>
          <Form.Item label={<Text style={{ fontSize: '16px', fontWeight: 'bold' }}>Heure Début</Text>}>
            <TimePicker
              style={{ fontSize: '16px', width: '100%' }}
              format="HH:mm"
              value={newEvent.rendezvousHeureDebut ? moment(newEvent.rendezvousHeureDebut, 'HH:mm:ss') : null}
              onChange={(time) => handleInputChange('rendezvousHeureDebut', time)}
            />
          </Form.Item>
          <Form.Item label={<Text style={{ fontSize: '16px', fontWeight: 'bold' }}>Heure Fin</Text>}>
            <TimePicker
              style={{ fontSize: '16px', width: '100%' }}
              format="HH:mm"
              value={newEvent.rendezvousHeureFin ? moment(newEvent.rendezvousHeureFin, 'HH:mm:ss') : null}
              onChange={(time) => handleInputChange('rendezvousHeureFin', time)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Calendrier;
