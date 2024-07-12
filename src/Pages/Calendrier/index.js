import React, { useState, useEffect } from 'react';
import { Card, Calendar, Badge, Modal, Form, Input, TimePicker, Button, DatePicker, Typography } from 'antd';
import moment from 'moment';
import axiosInstance from '../../Middleware/axiosInstance';

const { Title, Text } = Typography;

const Calendrier = ({ cardStyle }) => {
  const [eventsData, setEventsData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // State to track selected date
  const [newEvent, setNewEvent] = useState({
    id: null,
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
          id: rendezvous.id,
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
          <div key={index} style={{ marginBottom: 8 }} onClick={() => handleEventClick(event)}>
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

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setNewEvent({
      ...newEvent,
      date: date,
    });
    showModal();
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFormSubmit = () => {
    const { id, date, title, description, rendezvousHeureDebut, rendezvousHeureFin } = newEvent;

    const apiCall = id
      ? axiosInstance.put(`/api/rendezvous/${id}`, {
          Date: date.format('YYYY-MM-DD'),
          Sujet: title,
          Description: description,
          HeureDebut: rendezvousHeureDebut.format('HH:mm:ss'),
          HeureFin: rendezvousHeureFin.format('HH:mm:ss'),
        })
      : axiosInstance.post('/api/rendezvous', {
          Date: date.format('YYYY-MM-DD'),
          Sujet: title,
          Description: description,
          HeureDebut: rendezvousHeureDebut.format('HH:mm:ss'),
          HeureFin: rendezvousHeureFin.format('HH:mm:ss'),
        });

    apiCall
      .then((response) => {
        fetchRendezvousData();
        setIsModalVisible(false);
        setNewEvent({
          id: null,
          date: null,
          title: '',
          description: '',
          rendezvousHeureDebut: null,
          rendezvousHeureFin: null,
        });
      })
      .catch((error) => {
        console.error('Error submitting event:', error);
      });
  };

  const handleInputChange = (field, value) => {
    setNewEvent({
      ...newEvent,
      [field]: value,
    });
  };

  const handleEventClick = (event) => {
    setNewEvent({
      id: event.id,
      date: moment(event.date, 'YYYY-MM-DD'),
      title: event.title,
      description: event.description,
      rendezvousHeureDebut: event.rendezvousHeureDebut,
      rendezvousHeureFin: event.rendezvousHeureFin,
    });
    setIsModalVisible(true);
  };

  return (
    <Card style={{ ...cardStyle, width: '100%' }} title={<Title style={{ fontSize: '24px', fontWeight: 'bold' }}>Calendrier</Title>}>
      <Button type="primary" onClick={showModal} style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px', marginBottom: 16 }}>
        Ajouter un événement
      </Button>
      <Calendar dateCellRender={dateCellRender} onSelect={handleDateSelect} />
      <Modal
        title={<Title style={{ fontSize: '24px', fontWeight: 'bold' }}>{newEvent.id ? 'Modifier' : 'Ajouter'} un événement</Title>}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel} style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px' }}>
            Annuler
          </Button>,
          <Button key="submit" type="primary" onClick={handleFormSubmit} style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px' }}>
            {newEvent.id ? 'Modifier' : 'Ajouter'}
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label={<Text style={{ fontSize: '16px', fontWeight: 'bold' }}>Date</Text>}>
            <DatePicker
              style={{ fontSize: '16px', width: '100%' }}
              value={newEvent.date || selectedDate} // Set initial value from selected date
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
              value={newEvent.rendezvousHeureDebut}
              onChange={(time) => handleInputChange('rendezvousHeureDebut', time)}
            />
          </Form.Item>
          <Form.Item label={<Text style={{ fontSize: '16px', fontWeight: 'bold' }}>Heure Fin</Text>}>
            <TimePicker
              style={{ fontSize: '16px', width: '100%' }}
              format="HH:mm"
              value={newEvent.rendezvousHeureFin}
              onChange={(time) => handleInputChange('rendezvousHeureFin', time)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Calendrier;
