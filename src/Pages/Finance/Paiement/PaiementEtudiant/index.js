import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Dropdown, Menu, Typography, Input, Card, Row, Col, Form, Drawer, Descriptions, message, Modal, Select, DatePicker } from 'antd';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import axiosInstance from '../../../../Middleware/axiosInstance';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

const CrudTable = () => {
  const [data, setData] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState(null); // Use null for no action
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [globalSearchText, setGlobalSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [form] = Form.useForm(); // Ant Design form instance

  const searchInput = React.useRef(null);

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  const fetchData = async () => {
    setRefreshLoading(true);
    try {
      const response = await axiosInstance.get('/api/paiementetudiant', {
        params: {
          page: pagination.current,
          pageSize: pagination.pageSize,
        },
      });
      setData(response.data);
      setPagination({ ...pagination, total: response.data.total });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleMenuClick = (record, action) => {
    setSelectedRecord(record);
    if (action === 'edit') {
      setDrawerType('edit');
      setDrawerVisible(true);
    } else if (action === 'delete') {
      showDeleteConfirm(record.ID_PaiementEtudiants);
    } else if (action === 'view') {
      setDrawerType('view');
      setDrawerVisible(true);
    }
  };

  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        handleDelete(id);
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/paiementetudiant/${id}`);
      message.success(' supprimé avec succès');
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const menu = (record) => (
    <Menu onClick={({ key }) => handleMenuClick(record, key)}>
      <Menu.Item key="view" icon={<EyeOutlined />} style={{ fontSize: '16px' }}>Afficher</Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />} style={{ fontSize: '16px' }}>Modifier</Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} style={{ fontSize: '16px' }}>Supprimer</Menu.Item>
    </Menu>
  );

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  const handleGlobalSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setGlobalSearchText(value);

    if (value === '') {
      fetchData();
      return;
    }

    const filteredData = data.filter(item =>
      Object.keys(item).some(key =>
        String(item[key]).toLowerCase().includes(value)
      )
    );

    setData(filteredData);
  };

  const renderText = (text, highlightText) => (
    <Highlighter
      highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
      searchWords={[highlightText]}
      autoEscape
      textToHighlight={text ? text.toString() : ''}
    />
  );

  const columns = [
    {
        title: <Text strong style={{ fontSize: '16px' }}>Nom d'etudiant</Text>,
        dataIndex: 'NomEtudiant',
        key: 'NomEtudiant',
        sorter: (a, b) => a.NomEtudiant.localeCompare(b.NomEtudiant),
        ...getColumnSearchProps('NomEtudiant'),
        render: (text) => (
          <Text strong style={{ fontSize: '16px' }}>
            {renderText(text, globalSearchText)}
          </Text>
        ),
        ellipsis: true,
      },
    {
        title: <Text strong style={{ fontSize: '16px' }}>Prenom d'etudiant</Text>,
        dataIndex: 'PrenomEtudiant',
        key: 'PrenomEtudiant',
        sorter: (a, b) => a.PrenomEtudiant.localeCompare(b.PrenomEtudiant),
        ...getColumnSearchProps('PrenomEtudiant'),
        render: (text) => (
          <Text strong style={{ fontSize: '16px' }}>
            {renderText(text, globalSearchText)}
          </Text>
        ),
        ellipsis: true,
      },
    {
        title: <Text strong style={{ fontSize: '16px' }}>Type Paiement</Text>,
        dataIndex: 'TypePaiement',
        key: 'TypePaiement',
        sorter: (a, b) => a.TypePaiement.localeCompare(b.TypePaiement),
        ...getColumnSearchProps('TypePaiement'),
        render: (text) => (
          <Text strong style={{ fontSize: '16px' }}>
            {renderText(text, globalSearchText)}
          </Text>
        ),
        ellipsis: true,
      },
  
  {
    title: <Text strong style={{ fontSize: '16px' }}>Date Paiement</Text>,
    dataIndex: 'DatePaiementEtudiants',
    key: 'DatePaiementEtudiants',
    sorter: (a, b) => a.DatePaiementEtudiants.localeCompare(b.DatePaiementEtudiants),
    ...getColumnSearchProps('DatePaiementEtudiants'),
    render: (text) => (
      <Text strong style={{ fontSize: '16px' }}>
        {renderText(moment(text).format('DD/MM/YYYY'), globalSearchText)}
      </Text>
    ),
    ellipsis: true,
  },
 
  {
    title: <Text strong style={{ fontSize: '16px' }}>Montant</Text>,
    dataIndex: 'Montant',
    key: 'Montant',
    sorter: (a, b) => {
      if (typeof a.Montant === 'number' && typeof b.Montant === 'number') {
        return a.Montant - b.Montant;
      }
      return a.Montant.toString().localeCompare(b.Montant.toString());
    },
    ...getColumnSearchProps('Montant'),
    render: (text) => (
      <Text strong style={{ fontSize: '16px' }}>
        {renderText(text, globalSearchText)} 
      </Text>
    ),
    ellipsis: true,
  },
  
  {
    title: <Text strong style={{ fontSize: '16px' }}>Reste</Text>,
    dataIndex: 'Reste',
    key: 'Reste',
    sorter: (a, b) => {
      if (typeof a.Reste === 'number' && typeof b.Reste === 'number') {
        return a.Reste - b.Reste;
      }
      return a.Reste.toString().localeCompare(b.Reste.toString());
    },
    ...getColumnSearchProps('Reste'),
    render: (text) => (
      <Text strong style={{ fontSize: '16px' }}>
        {renderText(text, globalSearchText)} 
      </Text>
    ),
    ellipsis: true,
  },
  
  {
    title: <Text strong style={{ fontSize: '16px' }}>Montant total</Text>,
    dataIndex: 'MontantTotal',
    key: 'MontantTotal',
    sorter: (a, b) => {
      if (typeof a.MontantTotal === 'number' && typeof b.MontantTotal === 'number') {
        return a.MontantTotal - b.MontantTotal;
      }
      return a.MontantTotal.toString().localeCompare(b.MontantTotal.toString());
    },
    ...getColumnSearchProps('MontantTotal'),
    render: (text) => (
      <Text strong style={{ fontSize: '16px' }}>
        {renderText(text, globalSearchText)} 
      </Text>
    ),
    ellipsis: true,
  },
  
  
  
  {
    title: '',
    key: 'action',
    render: (text, record) => (
      <Dropdown overlay={menu(record)} trigger={['click']}>
        <Button icon={<EllipsisOutlined />} style={{ fontWeight: 'bold', fontSize: '16px' }} />
      </Dropdown>
    ),
  },
];

  

  const handleAddNew = () => {
    setDrawerType('add');
    setDrawerVisible(true);
    form.resetFields(); // Reset form fields when opening 'Ajouter un nouvel utilisateur' drawer
  };

 
  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setDrawerType(null); // Reset drawer type when closing
    form.resetFields(); // Reset form fields when closing drawer
  };

  // const handleFormSubmit = async (values) => {
  //   try {
        
  //     if (drawerType === 'add') {
  //       await axiosInstance.post('/api/absence', values);
  //       message.success(' ajouté avec succès');
  //     } else if (drawerType === 'edit' && selectedRecord) {
  //       const updatedValues = { ...selectedRecord, ...values }; // Ensure ID is included
  //       await axiosInstance.put(`/api/absence/${selectedRecord.ID_Absence}`, updatedValues);
  //       message.success(' modifié avec succès');
  //     }

  //     handleCloseDrawer();
  //     fetchData(); // Refresh data after submission
  //   } catch (error) {
  //     console.error('Error saving data:', error);
  //   }
  // };

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
  };

  const handleRefreshClick = () => {
    setRefreshLoading(true); // Set loading to true on button click
  
    // Simulate a delay of 1 second (1000ms) before fetching data
    setTimeout(() => {
      fetchData(); // Fetch data after delay
      setSearchText(''); // Clear column search text
      setSearchedColumn(''); // Clear column searchedColumn
      setGlobalSearchText(''); // Clear global search text
    }, 1100); // Adjust delay time as needed
  };
  
  const [typepaiementOptions, setTypePaiementOptions] = useState([]);
  useEffect(() => {
    const fetchTypePaiementOptions = async () => {
      try {
        const response = await axiosInstance.get('/api/typepaiement');
        setTypePaiementOptions(response.data);
      } catch (error) {
        console.error('Error fetching filiere options:', error);
        message.error('Erreur lors du chargement des options de filiere');
      }
    };

    fetchTypePaiementOptions();
  }, []);

  const AddUserForm = () => {
    const [form] = Form.useForm(); // Use Ant Design Form hook
  
    // State for options and selections
    const [etudiantOptions, setEtudiantOptions] = useState([]);
    const [inscriptionOptions, setInscriptionOptions] = useState([]);
    const [selectedInscription, setSelectedInscription] = useState(null);
    const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  
    // Fetch student options
    useEffect(() => {
      const fetchEtudiantOptions = async () => {
        try {
          const response = await axiosInstance.get('/api/etudiants');
          setEtudiantOptions(response.data.map(etudiant => ({
            id: etudiant.ID_Etudiant,
            label: `${etudiant.NomEtudiant} ${etudiant.PrenomEtudiant}`,
        })));
        } catch (error) {
          console.error('Error fetching etudiant options:', error);
        }
      };
      fetchEtudiantOptions();
    }, []);
  
    // Fetch inscription options based on selected student
    useEffect(() => {
      const fetchInscription = async (etudiantId) => {
        try {
          const response = await axiosInstance.get(`/api/jointure/inscription-etudiant/${etudiantId}`);
          return response.data.map(inscription => ({
            id: inscription.ID_Inscription,
            label: `${inscription.NomEtudiant} ${inscription.PrenomEtudiant} : EHPM-INS-${inscription.ID_Inscription}`, // Adjust the label if needed
          }));
        } catch (error) {
          console.error('Error fetching inscription options:', error);
          return [];
        }
      };
  
      const updateInscriptionOptions = async (etudiantId) => {
        if (etudiantId) {
          const inscription = await fetchInscription(etudiantId);
          setInscriptionOptions(inscription);
        } else {
          setInscriptionOptions([]);
        }
      };
  
      updateInscriptionOptions(selectedEtudiant);
    }, [selectedEtudiant]);
  
    // Handle student change
    const handleEtudiantChange = (value) => {
      setSelectedEtudiant(value);
      setSelectedInscription(null);
    };
  
    // Handle inscription change
    const handleInscriptionChange = (value) => {
      setSelectedInscription(value);
    };
  
    const handleFormSubmit = async (values) => {
      try {
        const formData = {
          ...values,
          ID_Inscription: selectedInscription,
          ID_Etudiant: selectedEtudiant,
        };
        console.log(formData);
        await axiosInstance.post('/api/paiementetudiant', formData);
        message.success('Paiement ajouté avec succès');
        handleCloseDrawer();
        fetchData(); // Refresh data after submission
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
  
    return (
      <Form layout="vertical" onFinish={handleFormSubmit}>
        <Form.Item
         
          label={<Text strong style={{ fontSize: '16px' }}>Nom étudiant</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            style={{ fontSize: '16px' }}
            placeholder="Sélectionner un étudiant"
            onChange={handleEtudiantChange}
            value={selectedEtudiant}
          >
            {etudiantOptions.map(etudiant => (
              <Option style={{ fontSize: '16px' }} key={etudiant.id} value={etudiant.id}>{etudiant.label}</Option>
            ))}
          </Select>
        </Form.Item>
  
        <Form.Item
          label={<Text strong style={{ fontSize: '16px' }}>L'inscription</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            style={{ fontSize: '16px' }}
            placeholder="Sélectionner une inscription"
            onChange={handleInscriptionChange}
            value={selectedInscription}
            disabled={!selectedEtudiant}
          >
            {inscriptionOptions.map(inscription => (
              <Option style={{ fontSize: '16px' }} key={inscription.id} value={inscription.id}>{inscription.label}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="ID_TypePaiement"
          label={<Text strong style={{ fontSize: '16px' }}>Type Paiement</Text>}
          rules={[{ required: true, message: 'Veuillez sélectionner un type de paiement' }]}
          style={{ fontSize: '16px' }}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            style={{ fontSize: '16px', width: '100%', minHeight: '40px' }}
            placeholder="Sélectionner un type de paiement"
          >
            {typepaiementOptions.map(typepaiement => (
              <Option key={typepaiement.ID_TypePaiement} value={typepaiement.ID_TypePaiement} style={{ fontSize: '16px' }}>
                {typepaiement.TypePaiement}
              </Option>
            ))}
          </Select>
        </Form.Item>
  
        <Form.Item
          name="DatePaiementEtudiants"
          label={<Text strong style={{ fontSize: '16px' }}>Date Paiement</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
        >
          <DatePicker style={{ fontSize: '16px', width: "100%" }} />
        </Form.Item>
  
        <Form.Item
          name="Montant"
          label={<Text strong style={{ fontSize: '16px' }}>Montant</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
        >
          <Input type="number" style={{ fontSize: '16px' }} />
        </Form.Item>
  
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px', marginRight: '10px' }}>
            Ajouter
          </Button>
          <Button style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px' }} onClick={handleCloseDrawer}>
            Annuler
          </Button>
        </Form.Item>
      </Form>
    );
  };
  
  


const EditUserForm = () => {
  const [form] = Form.useForm(); // Use Ant Design Form hook

  // State for options and selections
  const [etudiantOptions, setEtudiantOptions] = useState([]);
  const [inscriptionOptions, setInscriptionOptions] = useState([]);
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);

  // Function to get initial values excluding sensitive fields
  const getInitialValues = () => {
    const initialValues = { ...selectedRecord };
  delete  initialValues.DateDebutAbsence 
  delete  initialValues.DateFinAbsence 

    return initialValues;
  };

  // Set initial form values when selectedRecord changes
  useEffect(() => {
    form.setFieldsValue(getInitialValues());
    setSelectedEtudiant(selectedRecord.ID_Etudiant);
    setSelectedInscription(selectedRecord.ID_Inscription);
  }, [selectedRecord]);

  // Fetch class options
  useEffect(() => {
    const fetchEtudiantOptions = async () => {
      try {
        const response = await axiosInstance.get('/api/etudiants');
        setEtudiantOptions(response.data.map(etudiant => ({
          id: etudiant.ID_Etudiant,
          label: etudiant.NomEtudiant,
        })));
      } catch (error) {
        console.error('Error fetching classe options:', error);
      }
    };
    fetchEtudiantOptions();
  }, []);

  // Fetch student options based on selected class
  useEffect(() => {
    const fetchInscription = async (etudiantId) => {
      try {
        const response = await axiosInstance.get(`/api/jointure/inscription-etudiant/${etudiantId}`);
        return response.data.map(inscription => ({
          id: inscription.ID_Inscription,
          label: inscription.NomEtudiant,
        }));
      } catch (error) {
        console.error('Error fetching etudiant options:', error);
        return [];
      }
    };

    const updateInscriptionOptions = async (etudiantId) => {
      if (etudiantId) {
        const inscription = await fetchInscription(etudiantId);
        setInscriptionOptions(inscription);
      } else {
        setInscriptionOptions([]);
      }
    };

    updateInscriptionOptions(selectedEtudiant);
  }, [selectedEtudiant]);

  // Handle class change
  const handleClasseChange = (value) => {
    setSelectedEtudiant(value);
    setSelectedInscription(null);
  };

  // Handle student change
  const handleEtudiantChange = (value) => {
    setSelectedInscription(value);
  };

  // Handle form submission
  const handleFormSubmit = async (values) => {
    try {
      const formData = {
        ...selectedRecord,
        ...values,
        ID_Inscription : selectedInscription,
        ID_Etudiant: selectedEtudiant,
      };
      console.log('Form data being submitted:', formData);
      await axiosInstance.put(`/api/paiementetudiant/${selectedRecord.ID_PaiementEtudiants}`, formData);
      message.success('Absence modifiée avec succès');
      handleCloseDrawer();
      fetchData(); // Refresh data after submission
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormSubmit}
      initialValues={getInitialValues()}
    >
      <Form.Item
  label={<Text strong style={{ fontSize: '16px' }}>Nom etudiant</Text>}
  rules={[{ required: true, message: 'Champ requis' }]}
>
  <Select
    showSearch
    filterOption={(input, option) =>
      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
    }
    style={{ fontSize: '16px' }}
    placeholder="Sélectionner une classe"
    onChange={handleClasseChange}
  >
    {etudiantOptions.map(etudiant => (
      <Option style={{ fontSize: '16px' }} key={etudiant.id} value={etudiant.id}>{etudiant.label}</Option>
    ))}
  </Select>
</Form.Item>

<Form.Item
  label={<Text strong style={{ fontSize: '16px' }}>l'inscription</Text>}
  rules={[{ required: true, message: 'Champ requis' }]}
>
  <Select
    showSearch
    filterOption={(input, option) =>
      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
    }
    style={{ fontSize: '16px' }}
    placeholder="Sélectionner un étudiant"
    onChange={handleEtudiantChange}
    value={selectedInscription}
    disabled={!selectedEtudiant}
  >
    {inscriptionOptions.map(inscription => (
      <Option style={{ fontSize: '16px' }} key={inscription.id} value={inscription.id}>{inscription.label}</Option>
    ))}
  </Select>
</Form.Item>
<Form.Item
        name="ID_TypePaiement"
        label={<Text strong style={{ fontSize: '16px' }}>Type Paiement</Text>}
        rules={[{ required: true, message: 'Veuillez sélectionner Filiere' }]}
        style={{ fontSize: '16px' }}
      >
        <Select
         showSearch
         filterOption={(input, option) =>
           (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
         }
          style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
          placeholder="Sélectionner une filiere"
        >
          {typepaiementOptions.map(typepaiement => (
            <Option key={typepaiement.ID_TypePaiement} value={typepaiement.ID_TypePaiement} style={{ fontSize: '16px' }}>
              {typepaiement.TypePaiement}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="DatePaiementEtudiants"
        label={<Text strong style={{ fontSize: '16px' }}>Date Paiement</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <DatePicker  style={{ fontSize: '16px',width : "100%" }} />
      </Form.Item>
   
      <Form.Item
        name="Montant"
        label={<Text strong style={{ fontSize: '16px' }}>Montant</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input type="number" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item>
        <Button style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px', marginRight: '10px' }} type="primary" htmlType="submit">
          Modifier
        </Button>
        <Button style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px' }} onClick={handleCloseDrawer}>
          Annuler
        </Button>
      </Form.Item>
    </Form>
  );
};



  
  return (
    <div style={{ padding: '40px', fontSize: '16px' }}>
      <Card style={{ borderRadius: '10px', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '2px 6px 14px rgba(0, 0, 0.1, 0.2)' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={3} style={{ fontSize: '24px' }}>Listes des paiement etudiant</Title>
          <Row justify="end" align="middle" style={{ marginBottom: '16px' }}>
            <Col>
              <Space>
                <Input
                  value={globalSearchText}
                  onChange={handleGlobalSearch}
                  placeholder="recherche"
                  style={{
                    width: 300,
                    fontSize: '16px',
                    borderRadius: '15px',
                    fontWeight: 'bold',
                    padding: '6px 24px',
                    height: 'auto'
                  }}
                />
                <Button
                  icon={<RedoOutlined />}
                  onClick={() => handleRefreshClick()}
                  style={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    height: 'auto',
                    padding: '6px 24px',
                    borderRadius: '15px'
                  }}
                >
                  Actualiser
                </Button>
                <Button
                  type="primary"
                  onClick={handleAddNew}
                  style={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    height: 'auto',
                    padding: '6px 24px',
                    borderRadius: '15px'
                  }}
                >
                  Ajouter un paiement etudiant
                </Button>
              </Space>
            </Col>
          </Row>
          <Table columns={columns} dataSource={data} rowKey="ID_PaiementEtudiants" pagination={pagination} loading={refreshLoading}
            onChange={handleTableChange}  scroll={{ x: 'max-content' }} // This helps with horizontal scrolling if the table is too wide
            size="middle" // Optionally change the size of the table (default, middle, small)
            rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'} />
        </Space>
      </Card>

      <Drawer
  title={
    <Text strong style={{ fontSize: '22px' }}>
 {drawerType === 'add' ? 'Ajouter paiement etudiant' : drawerType === 'edit' ? 'Modifier paiement etudiant' : 'Afficher paiement etudiant'}

    </Text>
  }
  width={drawerType === 'view' ? 720 : 480}
  onClose={handleCloseDrawer}
  visible={drawerVisible}
  bodyStyle={{ paddingBottom: 80 }}
>
  {drawerType === 'view' ? (
    <Descriptions column={1} bordered>
        <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Nom Etudiant</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.NomEtudiant}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Prenom Etudiant</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.PrenomEtudiant}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Date Paiement</Text>}>
        <Text style={{ fontSize: '16px' }}>{moment(selectedRecord?.DatePaiementEtudiants).format('DD/MM/YYYY')}</Text>
      </Descriptions.Item>
   
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Montant</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.Montant}</Text>
      </Descriptions.Item>
   
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Reste</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.Reste}</Text>
      </Descriptions.Item>
   
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>MontantTotal</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.MontantTotal}</Text>
      </Descriptions.Item>
      
    </Descriptions>
  ) : (
    <>
      {drawerType === 'add' && <AddUserForm />}
      {drawerType === 'edit' && <EditUserForm />}
    </>
  )}
</Drawer>

    </div>
  );
};

export default CrudTable;
