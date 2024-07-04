import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Dropdown, Menu, Typography, Input, Card, Row, Col, Form, Drawer, Descriptions, message, Modal, Select, Upload } from 'antd';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined, PlusOutlined, RedoOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import axiosInstance from '../../../Middleware/axiosInstance';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const CrudTable = () => {
  const [data, setData] = useState(null);
  const [dataetudiantcount, setDataetudiantcount] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState(null); // Use null for no action
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [globalSearchText, setGlobalSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);
  const [visibleModal, setVisibleModal] = useState(false);

  const toggleModal = () => {
    setVisibleModal(!visibleModal);
  };
  const [form] = Form.useForm(); // Ant Design form instance

  const searchInput = React.useRef(null);

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  const fetchData = async () => {
    setRefreshLoading(true);
    try {
        const response = await axiosInstance.get('/api/filiere', {
            params: {
                page: pagination.current,
                pageSize: pagination.pageSize,
            },
        });

        const response2 = await axiosInstance.get('/api/filiere/etud');

        if (response2.data) {
            setData(response.data);
            setDataetudiantcount(response2.data);
            console.log("Data from response2:", response2.data);
        } else {
            console.log("Empty response from response2:", response2);
        }

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
      showDeleteConfirm(record.ID_Etudiant);
    } else if (action === 'view') {
      setDrawerType('view');
      setDrawerVisible(true);
    }
  };

  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cette filiere?',
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
      await axiosInstance.delete(`/api/filiere/${id}`);
      message.success('filiere supprimé avec succès');
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
        title: <Text strong style={{ fontSize: '16px' }}>ID Filiere</Text>,
        dataIndex: 'ID_Filiere',
        key: 'ID_Filiere',
        sorter: (a, b) => a.ID_Filiere.localeCompare(b.ID_Filiere),
        ...getColumnSearchProps('ID_Filiere'),
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

        title: <Text strong style={{ fontSize: '16px' }}>Nombre etudiant</Text>,
        dataIndex: 'count',
        key: 'count',
        sorter: (a, b) => a.count.localeCompare(b.count),
        ...getColumnSearchProps('count'),
        render: (text) => (
          <Text strong style={{ fontSize: '16px' }}>
            {renderText(text, globalSearchText)}
          </Text>
        ),
        ellipsis: true,
      },
  
    
  ];
  
  

  const handleAddNew = () => {
    setDrawerType('add');
    setDrawerVisible(true);
    form.resetFields(); // Reset form fields when opening 'Ajouter un nouvel utilisateur' drawer
  };

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);



  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setDrawerType(null);
    setSelectedRecord(null);
    form.resetFields();
    setFileList([]);// Reset form fields when closing drawer
  };
  

  const handleFormSubmit = async (values) => {
    const formData = new FormData();
    formData.append('ID_filiere', values.ID_filiere);
    formData.append('NomFiliere', values.NomFiliere);
   
  
    // Check if a file is selected before appending

  }
  

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
 
  const [filiereOptions, setFiliereOptions] = useState([]);
  useEffect(() => {
    const fetchFiliereOptions = async () => {
      try {
        const response = await axiosInstance.get('/api/filiere');
        setFiliereOptions(response.data);
      } catch (error) {
        console.error('Error fetching filiere options:', error);
        message.error('Erreur lors du chargement des options de filiere');
      }
    };

    fetchFiliereOptions();
  }, []);
  
  // Add Form Component for Ajouter Utilisateur
  const AddUserForm = () => (
    <Form layout="vertical" onFinish={handleFormSubmit}>


<Form.Item
    name="NomFiliere"
    label={<Text strong style={{ fontSize: '16px' }}>Nom Filiere</Text>}
    rules={[{ required: true, message: 'Champ requis' }]}
  >
    <Input placeholder="Entrez le nom de la filiere" style={{ fontSize: '16px' }} />
  </Form.Item>

  <Form.Item
    name="ID_Filiere"
    label={<Text strong style={{ fontSize: '16px' }}>ID Filiere</Text>}
    rules={[{ required: true, message: 'Champ requis' }]}
    style={{ fontSize: '16px' }}
  >
    <Input placeholder="Entrez l'ID de la filiere" style={{ fontSize: '16px' }} />
  </Form.Item>
    </Form>
  );

  // Edit Form Component for Modifier Utilisateur
  const EditUserForm = () => {
    const [form] = Form.useForm(); // Use Ant Design Form hook
  
    // Function to get initial values excluding MotDePasse
    const getInitialValues = () => {
      const initialValues = { ...selectedRecord };
     
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
    name="NomFiliere"
    label={<Text strong style={{ fontSize: '16px' }}>Nom Filiere</Text>}
    rules={[{ required: true, message: 'Champ requis' }]}
  >
    <Input placeholder="Entrez le nom de la filiere" style={{ fontSize: '16px' }} />
  </Form.Item>

  <Form.Item
    name="ID_Filiere"
    label={<Text strong style={{ fontSize: '16px' }}>ID Filiere</Text>}
    rules={[{ required: true, message: 'Champ requis' }]}
    style={{ fontSize: '16px' }}
  >
    <Input placeholder="Entrez l'ID de la filiere" style={{ fontSize: '16px' }} />
  </Form.Item>

      </Form>
    );
  };
  
  return (
    <div style={{ padding: '40px', fontSize: '16px' }}>
      <Card style={{ borderRadius: '10px', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '2px 6px 14px rgba(0, 0, 0.1, 0.2)' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={3} style={{ fontSize: '24px' }}>Liste des filieres</Title>
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
                  Ajouter une filiere
                </Button>
              </Space>
            </Col>
          </Row>
          <Table columns={columns} dataSource={data} rowKey="ID_Filiere" pagination={pagination} loading={refreshLoading}
            onChange={handleTableChange}  scroll={{ x: 'max-content' }} // This helps with horizontal scrolling if the table is too wide
            size="middle" // Optionally change the size of the table (default, middle, small)
            rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}   />
        </Space>
      </Card>

      <Drawer
  title={
    <Text strong style={{ fontSize: '22px' }}>
 {drawerType === 'add' ? 'Ajouter filiere' : drawerType === 'edit' ? 'Modifier filiere' : 'Afficher filiere'}

    </Text>
  }
  width={drawerType === 'view' ? 720 : 480}
  onClose={handleCloseDrawer}
  visible={drawerVisible}
  bodyStyle={{ paddingBottom: 80 }}
>
  {drawerType === 'view' ? (
    
    <Descriptions column={1} bordered>
 
              
 <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Nom Filiere</Text>}>
  <Text style={{ fontSize: '16px' }}>{selectedRecord?.NomFiliere}</Text>
</Descriptions.Item>
<Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>ID Filiere</Text>}>
  <Text style={{ fontSize: '16px' }}>{selectedRecord?.ID_Filiere}</Text>
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
