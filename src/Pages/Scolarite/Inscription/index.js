import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Dropdown, Menu, Typography, Input, Card, Row, Col, Form, Drawer, Descriptions, message, Modal, Select, DatePicker } from 'antd';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined,  RedoOutlined, SearchOutlined} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import axiosInstance from '../../../Middleware/axiosInstance';
import moment from 'moment';
import dayjs from 'dayjs';

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
        const response = await axiosInstance.get('/api/inscription', {
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
      showDeleteConfirm(record.ID_Inscription);
    } else if (action === 'view') {
      setDrawerType('view');
      setDrawerVisible(true);
    }
  };

  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cette inscription?',
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
      await axiosInstance.delete(`/api/inscription/${id}`);
      message.success('Inscription supprimé avec succès');
      fetchData();
    } catch (error) {
        message.error("Impossible de supprimer l'inscription. Il existe des enregistrements associés.");
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

        title: <Text strong style={{ fontSize: '16px' }}>Nom Etudiant</Text>,
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

        title: <Text strong style={{ fontSize: '16px' }}>Nom Filiere</Text>,
        dataIndex: 'NomFiliere',
        key: 'NomFiliere',
        sorter: (a, b) => a.NomFiliere.localeCompare(b.NomFiliere),
        ...getColumnSearchProps('NomFiliere'),
        render: (text) => (
          <Text strong style={{ fontSize: '16px' }}>
            {renderText(text, globalSearchText)}
          </Text>
        ),
        ellipsis: true,
      },
      {
        title: <Text strong style={{ fontSize: '16px' }}>Date Debut</Text>,
        dataIndex: 'DateDebutInscription',
        key: 'DateDebutInscription',
        sorter: (a, b) => a.DateDebutInscription.localeCompare(b.DateDebutInscription),
        ...getColumnSearchProps('DateDebutInscription'),
        render: (text) => (
          <Text strong style={{ fontSize: '16px' }}>
            {renderText(moment(text).format('DD/MM/YYYY'), globalSearchText)}
          </Text>
        ),
        ellipsis: true,
      },
      {
        title: <Text strong style={{ fontSize: '16px' }}>Date Fin</Text>,
        dataIndex: 'DateFinInscription',
        key: 'DateFinInscription',
        sorter: (a, b) => a.DateFinInscription.localeCompare(b.DateFinInscription),
        ...getColumnSearchProps('DateFinInscription'),
        render: (text) => (
          <Text strong style={{ fontSize: '16px' }}>
            {renderText(moment(text).format('DD/MM/YYYY'), globalSearchText)}
          </Text>
        ),
        ellipsis: true,
      },
   
    {

      title: <Text strong style={{ fontSize: '16px' }}>Frais</Text>,
      dataIndex: 'FraisInscription',
      key: 'FraisInscription',
      sorter: (a, b) => a.FraisInscription.localeCompare(b.FraisInscription),
      ...getColumnSearchProps('FraisInscription'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)} DH
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
    setDrawerType(null);
    setSelectedRecord(null);
    form.resetFields();
  };
  

  const handleFormSubmit = async (values) => {
    try {

    
        
      if (drawerType === 'add') {
        await axiosInstance.post('/api/inscription', values);
        message.success('inscription ajouté avec succès');
      } else if (drawerType === 'edit' && selectedRecord) {
        const updatedValues = { ...selectedRecord, ...values }; 
        await axiosInstance.put(`/api/inscription/${selectedRecord.ID_Inscription}`, updatedValues);
        message.success('Inscription modifié avec succès');
      }

      handleCloseDrawer();
      fetchData(); // Refresh data after submission
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  
  

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
 
  
  const [etudiantOptions, setEtudiantOptions] = useState([]);
  useEffect(() => {
    const fetchEtudiantOptions = async () => {
      try {
        const response = await axiosInstance.get('/api/etudiants');
        setEtudiantOptions(response.data);
      } catch (error) {
        console.error('Error fetching filiere options:', error);
        message.error('Erreur lors du chargement des options de classe');
      }
    };

    fetchEtudiantOptions();
  }, []);
  

  




  // Add Form Component for Ajouter Utilisateur
  const AddUserForm = () => (
    <Form layout="vertical" onFinish={handleFormSubmit}>


  <Form.Item
        name="ID_Etudiant"
        label={<Text strong style={{ fontSize: '16px' }}>Nom étudiant</Text>}
        rules={[{ required: true, message: 'Veuillez sélectionner etudiant' }]}
        style={{ fontSize: '16px' }}
      >
        <Select
         showSearch
         filterOption={(input, option) =>
           (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
         }
          style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
          placeholder="Sélectionner un etudiant"
        >
          {etudiantOptions.map(etudiant => (
            <Option key={etudiant.ID_Etudiant} value={etudiant.ID_Etudiant} style={{ fontSize: '16px' }}>
              {etudiant.NomEtudiant} {etudiant.PrenomEtudiant}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="DateDebutInscription"
        label={<Text strong style={{ fontSize: '16px' }}>Date début</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <DatePicker placeholder="Entrez la date debut" style={{ fontSize: '16px',width:"100%" }} />
      </Form.Item>
      <Form.Item
        name="DateFinInscription"
        label={<Text strong style={{ fontSize: '16px' }}>Date fin</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <DatePicker placeholder="Entrez la date fin" style={{ fontSize: '16px',width:"100%" }} />
      </Form.Item>
      <Form.Item
        name="FraisInscription"
        label={<Text strong style={{ fontSize: '16px' }}>Frais</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input type = "number" placeholder="Entrez la date fin" style={{ fontSize: '16px' }} />
      </Form.Item>
     
     

  <Form.Item>
          <Button  style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px',marginRight: '10px' }} type="primary" htmlType="submit" >
            Ajouter
          </Button>
          <Button  style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px' }} onClick={handleCloseDrawer}>
            Annuler
          </Button>
        </Form.Item>
    </Form>
  );

  // Edit Form Component for Modifier Utilisateur
  const EditUserForm = () => {
    const [form] = Form.useForm(); // Use Ant Design Form hook
  
    // Function to get initial values excluding MotDePasse
    const getInitialValues = () => {
      const initialValues = { ...selectedRecord };
  
    initialValues.DateDebutInscription = dayjs(initialValues.DateDebutInscription);
    initialValues.DateFinInscription = dayjs(initialValues.DateFinInscription);

      return initialValues;
    };
  
    useEffect(() => {
      form.setFieldsValue(getInitialValues());
    }, [selectedRecord]); // Update form fields when selectedRecord changes
  
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        initialValues={getInitialValues()}
      >
        
        <Form.Item
        name="ID_Etudiant"
        label={<Text strong style={{ fontSize: '16px' }}>Nom étudiant</Text>}
        rules={[{ required: true, message: 'Veuillez sélectionner etudiant' }]}
        style={{ fontSize: '16px' }}
      >
        <Select
         showSearch
         filterOption={(input, option) =>
           (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
         }
          style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
          placeholder="Sélectionner un etudiant"
        >
          {etudiantOptions.map(etudiant => (
            <Option key={etudiant.ID_Etudiant} value={etudiant.ID_Etudiant} style={{ fontSize: '16px' }}>
        {etudiant.NomEtudiant} {etudiant.PrenomEtudiant}
        </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="DateDebutInscription"
        label={<Text strong style={{ fontSize: '16px' }}>Date debut</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <DatePicker placeholder="Entrez la date debut" style={{ fontSize: '16px',width:"100%" }} />
      </Form.Item>
      <Form.Item
        name="DateFinInscription"
        label={<Text strong style={{ fontSize: '16px' }}>Date fin</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <DatePicker placeholder="Entrez la date fin" style={{ fontSize: '16px',width:"100%" }} />
      </Form.Item>
      <Form.Item
        name="FraisInscription"
        label={<Text strong style={{ fontSize: '16px' }}>Frais</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input type = "number" placeholder="Entrez la date fin" style={{ fontSize: '16px' }} />
      </Form.Item>
     
     

  <Form.Item>
          <Button  style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px',marginRight: '10px' }} type="primary" htmlType="submit" >
            Modifier
          </Button>
          <Button  style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px' }} onClick={handleCloseDrawer}>
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
          <Title level={3} style={{ fontSize: '24px' }}>Liste des inscriptions</Title>
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
                  Ajouter une inscription
                </Button>
              </Space>
            </Col>
          </Row>
          <Table columns={columns} dataSource={data} rowKey="ID_Inscription" pagination={pagination} loading={refreshLoading}
            onChange={handleTableChange}  scroll={{ x: 'max-content' }} // This helps with horizontal scrolling if the table is too wide
            size="middle" // Optionally change the size of the table (default, middle, small)
            rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}   />
        </Space>
      </Card>

      <Drawer
  title={
    <Text strong style={{ fontSize: '22px' }}>
 {drawerType === 'add' ? 'Ajouter inscription' : drawerType === 'edit' ? 'Modifier inscription' : 'Afficher inscription'}

    </Text>
  }
  width={drawerType === 'view' ? 720 : 480}
  onClose={handleCloseDrawer}
  visible={drawerVisible}
  bodyStyle={{ paddingBottom: 80 }}
>
  {drawerType === 'view' ? (
    
    <Descriptions column={1} bordered>
 
 <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Nom etudiant</Text>}>
  <Text style={{ fontSize: '16px' }}>{selectedRecord?.NomEtudiant}</Text>
</Descriptions.Item>
           
<Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Date debut</Text>}>
        <Text style={{ fontSize: '16px' }}>{moment(selectedRecord?.DateDebutInscription).format('DD/MM/YYYY')}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Date fin</Text>}>
        <Text style={{ fontSize: '16px' }}>{moment(selectedRecord?.DateFinInscription).format('DD/MM/YYYY')}</Text>
      </Descriptions.Item>
<Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Frais</Text>}>
  <Text style={{ fontSize: '16px' }}>{selectedRecord?.FraisInscription}</Text>
</Descriptions.Item>
<Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Montant totale</Text>}>
  <Text style={{ fontSize: '16px' }}>{selectedRecord?.MontantInscription} DH</Text>
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
