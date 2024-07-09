import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Calendar, Table, Badge, Typography, Space, TimePicker, Form, Input, Modal, Button, DatePicker } from 'antd';
import { UserOutlined, BankOutlined, LineChartOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import axiosInstance from '../../Middleware/axiosInstance';

const Dashboard = () => {
  // Mock data for statistics (replace with actual data)
  const scolariteStats = {
    etudiantCount: 250,
    inscriptionCount: 1500,
    formateurCount: 50,
    classeCount: 30,
    matiereCount: 20,
    filiereCount: 10,
    suiviStageCount: 100,
    emploiTempsCount: 50,
  };

  const financeStats = {
    factureCount: 300,
    fournisseurCount: 15,
    modePaiementCount: 4,
    paiementPersonnelCount: 200,
    paiementEtudiantCount: 1000,
    typePaiementCount: 5,
  };

  const cardStyle = {
    borderRadius: '10px',
    border: '2px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '2px 6px 14px rgba(0, 0, 0.1, 0.2)',
  };

  return (
    <div style={{ padding: '20px' }}>
      <Space size={[20, 20]} direction='vertical'>
        <Typography.Title level={4}>Tableau de bord</Typography.Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card style={cardStyle}>
              <Statistic title="Étudiants" value={scolariteStats.etudiantCount} prefix={<UserOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card style={cardStyle}>
              <Statistic title="Inscriptions" value={scolariteStats.inscriptionCount} prefix={<BankOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card style={cardStyle}>
              <Statistic title="Personnels" value={financeStats.factureCount} prefix={<LineChartOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card style={cardStyle}>
              <Statistic title="Formateurs" value={financeStats.paiementEtudiantCount} prefix={<LineChartOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card style={cardStyle}>
              <Statistic title="Rendez-vous" value={financeStats.paiementEtudiantCount} prefix={<LineChartOutlined />} />
            </Card>
          </Col>
        </Row>
        <DerniersRv cardStyle={cardStyle} />
        <DashboardCalendar cardStyle={cardStyle} />
      </Space>
    </div>
  );
};

// Le composant des derniers rendez-vous
function DerniersRv({ cardStyle }) {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage] = useState(1);
  const [pageSize] = useState(5);
  const [, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchRendezvouss = () => {
      const params = {
        page: currentPage,
        itemsPerPage: 3,
        'order[created_at]': 'DESC'
      };

      axios
        .get("/api/rendezvouses?pagination=true", { params })
        .then((response) => {
          setDataSource(response.data['hydra:member']);
          setTotalItems(response.data['hydra:totalItems']);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des données depuis l'API :", error);
          setLoading(false);
        });
    };

    setLoading(true);
    fetchRendezvouss();
  }, [currentPage, pageSize]);

  const columns = [
    { title: "Nom d'étudiant", dataIndex: 'nomPatient', key: 'nomPatient' },
    { title: "Email d'étudiant", dataIndex: 'emailPatient', key: 'emailPatient' },
    { title: 'Motif', dataIndex: 'maladie', key: 'maladie' },
    { title: 'Réception', dataIndex: 'medecin', key: 'medecin' },
    { title: 'Date de rendez-vous', dataIndex: 'dateRv', key: 'dateRv', render: (dateRv) => moment(dateRv).format('YYYY-MM-DD HH:mm:ss') },
  ];

  return (
    <Card style={{ ...cardStyle, width: '100%' }} title='Les derniers rendez-vous'>
      <Table
        columns={columns}
        loading={loading}
        dataSource={dataSource}
        pagination={false}
        size='small'
      />
    </Card>
  );
}

// Le composant de calendrier
const DashboardCalendar = ({ cardStyle }) => {
  const [eventsData, setEventsData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: null,
    title: '',
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
          <div key={index}>
            <Badge
              status='success'
              text={`${event.title} - ${moment(event.rendezvousHeureDebut, 'HH:mm:ss').format('HH:mm')} - ${moment(event.rendezvousHeureFin, 'HH:mm:ss').format('HH:mm')}`}
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
    const { date, title, rendezvousHeureDebut, rendezvousHeureFin } = newEvent;

    axiosInstance
      .post('/api/rendezvous', {
        Date: date,
        Sujet: title,
        HeureDebut: rendezvousHeureDebut,
        HeureFin: rendezvousHeureFin,
      })
      .then((response) => {
        fetchRendezvousData();
        setIsModalVisible(false);
        setNewEvent({
          date: null,
          title: '',
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
    <Card style={{ ...cardStyle, width: '100%' }} title='Calendrier'>
      <Button type="primary" onClick={showModal} style={{ marginBottom: 16 }}>
        Ajouter un événement
      </Button>
      <Calendar dateCellRender={dateCellRender} />
      <Modal
        title="Ajouter un événement"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Annuler
          </Button>,
          <Button key="submit" type="primary" onClick={handleFormSubmit}>
            Ajouter
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Date">
            <DatePicker
             
              value={newEvent.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Titre">
            <Input
              value={newEvent.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Heure de début">
            <TimePicker
              format="HH:mm"
              value={newEvent.rendezvousHeureDebut ? moment(newEvent.rendezvousHeureDebut, 'HH:mm:ss') : null}
              onChange={(time, timeString) => handleInputChange('rendezvousHeureDebut', timeString)}
            />
          </Form.Item>
          <Form.Item label="Heure de fin">
            <TimePicker
              format="HH:mm"
              value={newEvent.rendezvousHeureFin ? moment(newEvent.rendezvousHeureFin, 'HH:mm:ss') : null}
              onChange={(time, timeString) => handleInputChange('rendezvousHeureFin', timeString)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Dashboard;
