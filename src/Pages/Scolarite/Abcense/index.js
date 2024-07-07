import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Dropdown, Menu, Typography, Input, Card, Row, Col, Form, Drawer, Descriptions, message, Modal, Select } from 'antd';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import axiosInstance from '../../../Middleware/axiosInstance';
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
      const response = await axiosInstance.get('/api/absence', {
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
      showDeleteConfirm(record.ID_Absence);
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
      await axiosInstance.delete(`/api/absence/${id}`);
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
        title: <Text strong style={{ fontSize: '16px' }}>Nom etudiant</Text>,
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
        title: <Text strong style={{ fontSize: '16px' }}>Prenom etudiant</Text>,
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
    title: <Text strong style={{ fontSize: '16px' }}>Date Debut </Text>,
    dataIndex: 'DateDebutAbsence',
    key: 'DateDebutAbsence',
    sorter: (a, b) => a.DateDebutAbsence.localeCompare(b.DateDebutAbsence),
    ...getColumnSearchProps('DateDebutAbsence'),
    render: (text) => (
      <Text strong style={{ fontSize: '16px' }}>
        {renderText(moment(text).format('DD/MM/YYYY'), globalSearchText)}
      </Text>
    ),
    ellipsis: true,
  },
  {
    title: <Text strong style={{ fontSize: '16px' }}>Date Fin</Text>,
    dataIndex: 'DateFinAbsence',
    key: 'DateFinAbsence',
    sorter: (a, b) => a.DateFinAbsence.localeCompare(b.DateFinAbsence),
    ...getColumnSearchProps('DateFinAbsence'),
    render: (text) => (
      <Text strong style={{ fontSize: '16px' }}>
        {renderText(moment(text).format('DD/MM/YYYY'), globalSearchText)}
      </Text>
    ),
    ellipsis: true,
  },
  {
    title: <Text strong style={{ fontSize: '16px' }}>Nb heure</Text>,
    dataIndex: 'Nb_Heure',
    key: 'Nb_Heure',
    sorter: (a, b) => {
      if (typeof a.Nb_Heure === 'number' && typeof b.Nb_Heure === 'number') {
        return a.Nb_Heure - b.Nb_Heure;
      }
      return a.Nb_Heure.toString().localeCompare(b.Nb_Heure.toString());
    },
    ...getColumnSearchProps('Nb_Heure'),
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
  
  

  const AddUserForm= () => {
    const [classeOptions, setClasseOptions] = useState([]);
    const [etudiantOptions, setEtudiantOptions] = useState([]);
    const [selectedClasse, setSelectedClasse] = useState(null);
    const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  
    useEffect(() => {
      const fetchClasseOptions = async () => {
        try {
          const response = await axiosInstance.get('/api/classes');
          setClasseOptions(response.data.map(classe => ({
            id: classe.ID_Classe,
            label: classe.NomClasse,
          })));
        } catch (error) {
          console.error('Error fetching classe options:', error);
        }
      };
  
      fetchClasseOptions();
    }, []);
  
    useEffect(() => {
      const fetchEtudiants = async (classeId) => {
        try {
          const response = await axiosInstance.get(`/api/jointure/etudiant-classe/${classeId}`);
          return response.data.map(etudiant => ({
            id: etudiant.ID_Etudiant,
            label: `${etudiant.NomEtudiant} ${etudiant.PrenomEtudiant}`,          }));
        } catch (error) {
          console.error('Error fetching etudiant options:', error);
          return [];
        }
      };
  
      const updateEtudiantOptions = async (classeId) => {
        if (classeId) {
          const etudiants = await fetchEtudiants(classeId);
          setEtudiantOptions(etudiants);
        } else {
          setEtudiantOptions([]);
        }
      };
  
      updateEtudiantOptions(selectedClasse);
    }, [selectedClasse]);
  
    const handleClasseChange = (value) => {
      setSelectedClasse(value);
      setSelectedEtudiant(null);
    };
  
    const handleEtudiantChange = (value) => {
      setSelectedEtudiant(value);
    };
  
    const handleFormSubmit = async (values) => {
      try {
        const formData = {
          ...values,
          ID_Classe: selectedClasse,
          ID_Etudiant: selectedEtudiant,
        };
        console.log(formData)
        await axiosInstance.post('/api/absence', formData);
        message.success('Absence ajoutée avec succès');
        handleCloseDrawer();
        fetchData(); // Refresh data after submission
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
  
    return (
      <Form layout="vertical" onFinish={handleFormSubmit}>
       <Form.Item
  label={<Text strong style={{ fontSize: '16px' }}>Nom Classe</Text>}
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
    {classeOptions.map(classe => (
      <Option style={{ fontSize: '16px' }} key={classe.id} value={classe.id}>{classe.label}</Option>
    ))}
  </Select>
</Form.Item>

<Form.Item
  label={<Text strong style={{ fontSize: '16px' }}>Nom Etudiant</Text>}
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
    disabled={!selectedClasse}
  >
    {etudiantOptions.map(etudiant => (
      <Option style={{ fontSize: '16px' }} key={etudiant.id} value={etudiant.id}>{etudiant.label}</Option>
    ))}
  </Select>
</Form.Item>

   
        <Form.Item
          name="DateDebutAbsence"
          label={<Text strong style={{ fontSize: '16px' }}>Date Début</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
        >
          <Input type="date" style={{ fontSize: '16px' }} />
        </Form.Item>
        <Form.Item
          name="DateFinAbsence"
          label={<Text strong style={{ fontSize: '16px' }}>Date Fin</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
        >
          <Input type="date" style={{ fontSize: '16px' }} />
        </Form.Item>
        <Form.Item
        name="Nb_Heure"
        label={<Text strong style={{ fontSize: '16px' }}>Nb Heure</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input type="number" style={{ fontSize: '16px' }} />
      </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px', marginRight: '10px' }}>
            Ajouter
          </Button>
          <Button style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px' }}>
            Annuler
          </Button>
        </Form.Item>
      </Form>
    );
  };
  


const EditUserForm = () => {
  const [form] = Form.useForm(); // Use Ant Design Form hook

  // State for options and selections
  const [classeOptions, setClasseOptions] = useState([]);
  const [etudiantOptions, setEtudiantOptions] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
 // Format date to yyyy-MM-dd
 const formatDate = (date) => {
  return moment(date).format('YYYY-MM-DD');
};
  // Function to get initial values excluding sensitive fields
  const getInitialValues = () => {
    const initialValues = { ...selectedRecord };
    initialValues.DateDebutAbsence = formatDate(initialValues.DateDebutAbsence);
    initialValues.DateFinAbsence = formatDate(initialValues.DateFinAbsence);

    return initialValues;
  };

  // Set initial form values when selectedRecord changes
  useEffect(() => {
    form.setFieldsValue(getInitialValues());
    setSelectedClasse(selectedRecord.ID_Classe);
    setSelectedEtudiant(selectedRecord.ID_Etudiant);
  }, [selectedRecord]);

  // Fetch class options
  useEffect(() => {
    const fetchClasseOptions = async () => {
      try {
        const response = await axiosInstance.get('/api/classes');
        setClasseOptions(response.data.map(classe => ({
          id: classe.ID_Classe,
          label: classe.NomClasse,
        })));
      } catch (error) {
        console.error('Error fetching classe options:', error);
      }
    };
    fetchClasseOptions();
  }, []);

  // Fetch student options based on selected class
  useEffect(() => {
    const fetchEtudiants = async (classeId) => {
      try {
        const response = await axiosInstance.get(`/api/jointure/etudiant-classe/${classeId}`);
        return response.data.map(etudiant => ({
          id: etudiant.ID_Etudiant,
          label: etudiant.NomEtudiant,
        }));
      } catch (error) {
        console.error('Error fetching etudiant options:', error);
        return [];
      }
    };

    const updateEtudiantOptions = async (classeId) => {
      if (classeId) {
        const etudiants = await fetchEtudiants(classeId);
        setEtudiantOptions(etudiants);
      } else {
        setEtudiantOptions([]);
      }
    };

    updateEtudiantOptions(selectedClasse);
  }, [selectedClasse]);

  // Handle class change
  const handleClasseChange = (value) => {
    setSelectedClasse(value);
    setSelectedEtudiant(null);
  };

  // Handle student change
  const handleEtudiantChange = (value) => {
    setSelectedEtudiant(value);
  };

  // Handle form submission
  const handleFormSubmit = async (values) => {
    try {
      const formData = {
        ...selectedRecord,
        ...values,
        ID_Classe: selectedClasse,
        ID_Etudiant: selectedEtudiant,
      };
      console.log('Form data being submitted:', formData);
      await axiosInstance.put(`/api/absence/${selectedRecord.ID_Absence}`, formData);
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
  label={<Text strong style={{ fontSize: '16px' }}>Nom Classe</Text>}
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
    {classeOptions.map(classe => (
      <Option style={{ fontSize: '16px' }} key={classe.id} value={classe.id}>{classe.label}</Option>
    ))}
  </Select>
</Form.Item>

<Form.Item
  label={<Text strong style={{ fontSize: '16px' }}>Nom Etudiant</Text>}
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
    disabled={!selectedClasse}
  >
    {etudiantOptions.map(etudiant => (
      <Option style={{ fontSize: '16px' }} key={etudiant.id} value={etudiant.id}>{etudiant.label}</Option>
    ))}
  </Select>
</Form.Item>

      <Form.Item
        name="DateDebutAbsence"
        label={<Text strong style={{ fontSize: '16px' }}>Date Début</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input type="date" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="DateFinAbsence"
        label={<Text strong style={{ fontSize: '16px' }}>Date Fin</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input type="date" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="Nb_Heure"
        label={<Text strong style={{ fontSize: '16px' }}>Nb Heure</Text>}
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
          <Title level={3} style={{ fontSize: '24px' }}>Listes des absences</Title>
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
                  Ajouter une absence
                </Button>
              </Space>
            </Col>
          </Row>
          <Table columns={columns} dataSource={data} rowKey="ID_Stage" pagination={pagination} loading={refreshLoading}
            onChange={handleTableChange}  scroll={{ x: 'max-content' }} // This helps with horizontal scrolling if the table is too wide
            size="middle" // Optionally change the size of the table (default, middle, small)
            rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'} />
        </Space>
      </Card>

      <Drawer
  title={
    <Text strong style={{ fontSize: '22px' }}>
 {drawerType === 'add' ? 'Ajouter absence' : drawerType === 'edit' ? 'Modifier absence' : 'Afficher absence'}

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
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Date Debut</Text>}>
        <Text style={{ fontSize: '16px' }}>{moment(selectedRecord?.DateDebutAbsence).format('DD/MM/YYYY')}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Date Fin</Text>}>
        <Text style={{ fontSize: '16px' }}>{moment(selectedRecord?.DateFinAbsence).format('DD/MM/YYYY')}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Nb Heure</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.Nb_Heure}</Text>
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
