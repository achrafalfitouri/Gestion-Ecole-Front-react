import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Dropdown, Menu, Typography, Input, Card, Row, Col, Form, Drawer, Descriptions, message, Modal, Select } from 'antd';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import axiosInstance from '../../Middleware/axiosInstance';

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
      const response = await axiosInstance.get('/api/utilisateurs', {
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
      showDeleteConfirm(record.ID_Utilisateur);
    } else if (action === 'view') {
      setDrawerType('view');
      setDrawerVisible(true);
    }
  };

  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cet utilisateur?',
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
      await axiosInstance.delete(`/api/utilisateurs/${id}`);
      message.success('Utilisateur supprimé avec succès');
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
      title: <Text strong style={{ fontSize: '16px' }}>Nom</Text>,
      dataIndex: 'NomUtilisateur',
      key: 'NomUtilisateur',
      sorter: (a, b) => a.NomUtilisateur.localeCompare(b.NomUtilisateur),
      ...getColumnSearchProps('NomUtilisateur'),
      render: (text) => <Text strong style={{ fontSize: '16px' }}>{renderText(text, globalSearchText)}</Text>,
      ellipsis: true,

    },
    {
      title: <Text strong style={{ fontSize: '16px' }}>Prénom</Text>,
      dataIndex: 'PrenomUtilisateur',
      key: 'PrenomUtilisateur',
      sorter: (a, b) => a.PrenomUtilisateur.localeCompare(b.PrenomUtilisateur),
      ...getColumnSearchProps('PrenomUtilisateur'),
      render: (text) => <Text strong style={{ fontSize: '16px' }}>{renderText(text, globalSearchText)}</Text>,
      ellipsis: true,

    },
    {
      title: <Text strong style={{ fontSize: '16px' }}>Email</Text>,
      dataIndex: 'Email',
      key: 'Email',
      sorter: (a, b) => a.Email.localeCompare(b.Email),
      ...getColumnSearchProps('Email'),
      render: (text) => <Text strong style={{ fontSize: '16px' }}>{renderText(text, globalSearchText)}</Text>,
      ellipsis: true,

    },
    {
      title: <Text strong style={{ fontSize: '16px' }}>Role</Text>,
      dataIndex: 'NomRole',
      key: 'NomRole',
      sorter: (a, b) => a.NomRole.localeCompare(b.NomRole),
      ...getColumnSearchProps('NomRole'),
      render: (text) => <Text strong style={{ fontSize: '16px' }}>{renderText(text, globalSearchText)}</Text>,
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

  const handleFormSubmit = async (values) => {
    try {
      if (drawerType === 'add') {
        await axiosInstance.post('/api/utilisateurs', values);
        message.success('Utilisateur ajouté avec succès');
      } else if (drawerType === 'edit' && selectedRecord) {
        const updatedValues = { ...selectedRecord, ...values }; 
        await axiosInstance.put(`/api/utilisateurs/${selectedRecord.ID_Utilisateur}`, updatedValues);
        message.success('Utilisateur modifié avec succès');
      }
  
      handleCloseDrawer();
      fetchData(); // Refresh data after submission
    } catch (error) {
      console.error('Error saving data:', error);
      message.error('Une erreur est survenue lors de la sauvegarde des données');
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
  


  // Add Form Component for Ajouter Utilisateur
  const AddUserForm = () => (
    <Form layout="vertical" onFinish={handleFormSubmit}>
      <Form.Item
        name="NomUtilisateur"
        label={<Text strong style={{ fontSize: '16px' }}>Nom</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input placeholder="Entrez le nom de l'utilisateur" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="PrenomUtilisateur"
        label={<Text strong style={{ fontSize: '16px' }}>Prénom</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input placeholder="Entrez le prénom de l'utilisateur" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="Email"
        label={<Text strong style={{ fontSize: '16px' }}>Email</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input type="email" placeholder="Entrez l'email de l'utilisateur" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="MotDePasse"
        label={<Text strong style={{ fontSize: '16px' }}>Mot de passe</Text>}
        rules={[{ required: true, message: 'Veuillez entrer le mot de passe' }]}
      >
        <Input.Password style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
  name="ID_Role"
  label={<Text strong style={{ fontSize: '16px' }}>Rôle</Text>}
  rules={[{ required: true, message: 'Veuillez sélectionner le rôle de l\'utilisateur' }]}
  style={{ fontSize: '16px' }}
>
  <Select
    style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
    placeholder="Sélectionner un rôle"
  >
    <Option style={{ fontSize: '16px' }} value="1">Admin</Option>
    <Option style={{ fontSize: '16px' }} value="2">Receptionniste</Option>
  </Select>
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
      delete initialValues.MotDePasse; // Remove MotDePasse from initial values
      delete initialValues.ID_Role; // Remove MotDePasse from initial values
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
          name="NomUtilisateur"
          label={<Text strong style={{ fontSize: '16px' }}>Nom</Text>}
        >
          <Input placeholder="Entrez le nom de l'utilisateur" style={{ fontSize: '16px' }} />
        </Form.Item>
        <Form.Item
          name="PrenomUtilisateur"
          label={<Text strong style={{ fontSize: '16px' }}>Prénom</Text>}
        >
          <Input placeholder="Entrez le prénom de l'utilisateur" style={{ fontSize: '16px' }} />
        </Form.Item>
        <Form.Item
          name="Email"
          label={<Text strong style={{ fontSize: '16px' }}>Email</Text>}
        >
          <Input type="email" placeholder="Entrez l'email de l'utilisateur" style={{ fontSize: '16px' }} />
        </Form.Item>
        <Form.Item
          name="MotDePasse"
          label={<Text strong style={{ fontSize: '16px' }}>Mot de passe</Text>}
          shouldUpdate  // Ensure it updates
        >
          <Input.Password
            style={{ fontSize: '16px' }}
            placeholder="Laissez vide si vous ne voulez pas changer le mot de passe"
          />
        </Form.Item>
        <Form.Item
          name="ID_Role"
          label={<Text strong style={{ fontSize: '16px' }}>Rôle</Text>}
          style={{ fontSize: '16px' }}
          initialValue={selectedRecord?.NomRole}
        >
         <Select
    style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
    placeholder="Sélectionner un rôle"
  >
    <Option style={{ fontSize: '16px' }} value="1">Admin</Option>
    <Option style={{ fontSize: '16px' }} value="2">Receptionniste</Option>
          </Select>
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
          <Title level={3} style={{ fontSize: '24px' }}>Liste des Utilisateurs</Title>
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
                  Ajouter un utilisateur
                </Button>
              </Space>
            </Col>
          </Row>
      
          <Table columns={columns} dataSource={data} rowKey="ID_Etudiant" pagination={pagination} loading={refreshLoading}
            onChange={handleTableChange}  scroll={{ x: 'max-content' }} // This helps with horizontal scrolling if the table is too wide
            size="middle" // Optionally change the size of the table (default, middle, small)
            rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}   />
        </Space>
      </Card>

      <Drawer
  title={
    <Text strong style={{ fontSize: '22px' }}>
{drawerType === 'add' ? 'Ajouter Utilisateur' : drawerType === 'edit' ? 'Modifier Utilisateur' : 'Afficher Utilisateur'}
</Text>
  }
  width={drawerType === 'view' ? 720 : 480}
  onClose={handleCloseDrawer}
  visible={drawerVisible}
  bodyStyle={{ paddingBottom: 80 }}
>
  {drawerType === 'view' ? (
    <Descriptions column={1} bordered>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Nom</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.NomUtilisateur}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Prénom</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.PrenomUtilisateur}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Email</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.Email}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Role</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.NomRole}</Text>
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
