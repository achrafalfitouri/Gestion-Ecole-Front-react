import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Dropdown, Menu, Typography, Input, Card, Row, Col, Form, Drawer, Descriptions, message, Modal, Select, Upload } from 'antd';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined, RedoOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
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
      const response = await axiosInstance.get('/api/etudiants', {
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
      showDeleteConfirm(record.ID_Etudiant);
    } else if (action === 'view') {
      setDrawerType('view');
      setDrawerVisible(true);
    }
  };

  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce étudiant?',
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
      await axiosInstance.delete(`/api/etudiants/${id}`);
      message.success('etudiant supprimé avec succès');
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
      title: <Text strong style={{ fontSize: '16px' }}>Numero</Text>,
      dataIndex: 'NumEtudiant',
      key: 'NumEtudiant',
      sorter: (a, b) => a.NumEtudiant.localeCompare(b.NumEtudiant),
      ...getColumnSearchProps('NumEtudiant'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {
      title: <Text strong style={{ fontSize: '16px' }}>Nom</Text>,
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
      title: <Text strong style={{ fontSize: '16px' }}>Prenom</Text>,
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
      title: <Text strong style={{ fontSize: '16px' }}>Sexe</Text>,
      dataIndex: 'Sexe',
      key: 'Sexe',
      sorter: (a, b) => a.Sexe.localeCompare(b.Sexe),
      ...getColumnSearchProps('Sexe'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {
      title: <Text strong style={{ fontSize: '16px' }}>Date De Naissance</Text>,
      dataIndex: 'DateNaissance',
      key: 'DateNaissance',
      sorter: (a, b) => a.DateNaissance.localeCompare(b.DateNaissance),
      ...getColumnSearchProps('DateNaissance'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(moment(text).format('DD/MM/YYYY'), globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {
      title: <Text strong style={{ fontSize: '16px' }}>Lieu De Naissance</Text>,
      dataIndex: 'LieuNaissance',
      key: 'LieuNaissance',
      sorter: (a, b) => a.LieuNaissance.localeCompare(b.LieuNaissance),
      ...getColumnSearchProps('LieuNaissance'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {
      title: <Text strong style={{ fontSize: '16px' }}>Adresse</Text>,
      dataIndex: 'Adresse',
      key: 'Adresse',
      sorter: (a, b) => a.Adresse.localeCompare(b.Adresse),
      ...getColumnSearchProps('Adresse'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
      
    },
    {
      title: <Text strong style={{ fontSize: '16px' }}>Telephone</Text>,
      dataIndex: 'Tel',
      key: 'Tel',
      sorter: (a, b) => a.Tel.localeCompare(b.Tel),
      ...getColumnSearchProps('Tel'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {
      title: <Text strong style={{ fontSize: '16px' }}>Nationalité</Text>,
      dataIndex: 'Nationalite',
      key: 'Nationalite',
      sorter: (a, b) => a.Nationalite.localeCompare(b.Nationalite),
      ...getColumnSearchProps('Nationalite'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {
      title: <Text strong style={{ fontSize: '16px' }}>Filiere</Text>,
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

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setDrawerType('edit');
    setDrawerVisible(true);
    form.setFieldsValue(record); // Populate form fields with selected record data
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setDrawerType(null); // Reset drawer type when closing
    form.resetFields(); // Reset form fields when closing drawer
  };
  

  const handleFormSubmit = async (values) => {
    const formData = new FormData();
    formData.append('NumEtudiant', values.NumEtudiant);
    formData.append('NomEtudiant', values.NomEtudiant);
    formData.append('PrenomEtudiant', values.PrenomEtudiant);
    formData.append('Sexe', values.Sexe);
    formData.append('DateNaissance', moment(values.DateNaissance).format('YYYY-MM-DD'));
    formData.append('LieuNaissance', values.LieuNaissance);
    formData.append('Adresse', values.Adresse);
    formData.append('Tel', values.Tel);
    formData.append('Nationalite', values.Nationalite);
    formData.append('ID_Filiere', values.ID_Filiere);
  
    // Check if a file is selected before appending
    if (values.PhotoProfil && values.PhotoProfil.fileList.length > 0) {
      const file = values.PhotoProfil.fileList[0].originFileObj;
      console.log('form' , file)
    }
  

    try {
      let response;
      if (drawerType === 'add') {
        response = await axiosInstance.post('/api/etudiants', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        message.success('Étudiant ajouté avec succès');
      } else if (drawerType === 'edit') {
        response = await axiosInstance.put(`/api/etudiants/${selectedRecord.ID_Etudiant}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        message.success('Étudiant mis à jour avec succès');
      }
      console.log('Response from server:', response.data);
      setDrawerVisible(false);
      fetchData(); // Assuming fetchData is a function to refresh data after form submission
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Une erreur est survenue lors de la soumission du formulaire');
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
 

  const [fileList, setFileList] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);

  const handleChange = ({ fileList }) => {
    setFileList(fileList);

    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageUrl(null);
    }
  };

  

  // Add Form Component for Ajouter Utilisateur
  const AddUserForm = () => (
    <Form layout="vertical" onFinish={handleFormSubmit}>

<Form.Item
  name="PhotoProfil"
  label="Photo de Profil"
  
  rules={[{ required: true, message: 'Veuillez télécharger une photo de profil' }]}
>

  <Upload
    beforeUpload={() => false} // Prevent automatic upload
  >
    <Button icon={<UploadOutlined />}>Cliquez pour télécharger</Button>
  </Upload>
</Form.Item>
      <Form.Item
        name="NumEtudiant"
        label={<Text strong style={{ fontSize: '16px' }}>Numero</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input placeholder="Entrez le numero de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="NomEtudiant"
        label={<Text strong style={{ fontSize: '16px' }}>Nom</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input placeholder="Entrez le nom de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="PrenomEtudiant"
        label={<Text strong style={{ fontSize: '16px' }}>Prenom</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input  placeholder="Entrez le prenom de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
  name="Sexe"
  label={<Text strong style={{ fontSize: '16px' }}>sexe</Text>}
  rules={[{ required: true, message: 'Veuillez sélectionner le sexe de l\'etudiant' }]}
  style={{ fontSize: '16px' }}
>
  <Select
    style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
    placeholder="Sélectionner un rôle"
  >
    <Option style={{ fontSize: '16px' }} value="Masculin">Masculin</Option>
    <Option style={{ fontSize: '16px' }} value="Féminin">Féminin</Option>
  </Select>
</Form.Item>

      <Form.Item
        name="DateNaissance"
        label={<Text strong style={{ fontSize: '16px' }}>Date de Naissance</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input type = "date" placeholder="Entrez la date de naissance de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
     
      <Form.Item
        name="LieuNaissance"
        label={<Text strong style={{ fontSize: '16px' }}>Lieu de Naissance</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input  placeholder="Entrez le lieu de naissance de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      
      <Form.Item
        name="Adresse"
        label={<Text strong style={{ fontSize: '16px' }}>Adresse</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input  placeholder="Entrez l'Adresse de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="Tel"
        label={<Text strong style={{ fontSize: '16px' }}>Telephone</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input  placeholder="Entrez le telephpne " style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="Nationalite"
        label={<Text strong style={{ fontSize: '16px' }}>Nationalite</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input  placeholder="Entrez la Nationalite " style={{ fontSize: '16px' }} />
      </Form.Item>
      
      <Form.Item
  name="ID_Filiere"
  label={<Text strong style={{ fontSize: '16px' }}>Filiere</Text>}
  rules={[{ required: true, message: 'Veuillez sélectionner Filiere' }]}
  style={{ fontSize: '16px' }}
>
  <Select
    style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
    placeholder="Sélectionner une filiere"
  >
    <Option style={{ fontSize: '16px' }} value="1">1</Option>
    <Option style={{ fontSize: '16px' }} value="2">2</Option>
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
        name="NumEtudiant"
        label={<Text strong style={{ fontSize: '16px' }}>Numero</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input placeholder="Entrez le numero de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="NomEtudiant"
        label={<Text strong style={{ fontSize: '16px' }}>Nom</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input placeholder="Entrez le nom de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="PrenomEtudiant"
        label={<Text strong style={{ fontSize: '16px' }}>Prenom</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input  placeholder="Entrez le prenom de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
  name="Sexe"
  label={<Text strong style={{ fontSize: '16px' }}>sexe</Text>}
  rules={[{ required: true, message: 'Veuillez sélectionner le sexe de l\'etudiant' }]}
  style={{ fontSize: '16px' }}
>
  <Select
    style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
    placeholder="Sélectionner le sexe"
  >
    <Option style={{ fontSize: '16px' }} value="Masculin">Masculin</Option>
    <Option style={{ fontSize: '16px' }} value="Féminin">Feminin</Option>
  </Select>
</Form.Item>


      <Form.Item
        name="DateNaissance"
        label={<Text strong style={{ fontSize: '16px' }}>Date de Naissance</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input type = "date"  placeholder="Entrez la date de naissance de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
     
      <Form.Item
        name="LieuNaissance"
        label={<Text strong style={{ fontSize: '16px' }}>Lieu de Naissance</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input  placeholder="Entrez le lieu de naissance de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      
      <Form.Item
        name="Adresse"
        label={<Text strong style={{ fontSize: '16px' }}>Adresse</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input  placeholder="Entrez l'Adresse de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="Tel"
        label={<Text strong style={{ fontSize: '16px' }}>Telephone</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input  placeholder="Entrez le telephpne " style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="Nationalite"
        label={<Text strong style={{ fontSize: '16px' }}>Nationalite</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input  placeholder="Entrez la Nationalite " style={{ fontSize: '16px' }} />
      </Form.Item>
      
      <Form.Item
  name="ID_Filiere"
  label={<Text strong style={{ fontSize: '16px' }}>Filiere</Text>}
  rules={[{ required: true, message: 'Veuillez sélectionner Filiere' }]}
  style={{ fontSize: '16px' }}
>
  <Select
    style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
    placeholder="Sélectionner un rôle"
  >
    <Option style={{ fontSize: '16px' }} value="1">1</Option>
    <Option style={{ fontSize: '16px' }} value="2">2</Option>
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
          <Title level={3} style={{ fontSize: '24px' }}>Liste des Etudiants</Title>
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
                  Ajouter un Etudiant
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
 {drawerType === 'add' ? 'Ajouter Etudiant' : drawerType === 'edit' ? 'Modifier Etudiant' : 'Afficher Etudiant'}

    </Text>
  }
  width={480}
  onClose={handleCloseDrawer}
  visible={drawerVisible}
  bodyStyle={{ paddingBottom: 80 }}
>
  {drawerType === 'view' ? (
    <Descriptions column={1} bordered>
              <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Photo De Profil</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.PhotoProfil}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Numero</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.NumEtudiant}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Nom</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.NomEtudiant}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Prénom</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.PrenomEtudiant}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>sexe</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.Sexe}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Date de Naissance</Text>}>
        <Text style={{ fontSize: '16px' }}>{moment(selectedRecord?.DateNaissance).format('DD/MM/YYYY')}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>lieu de Naissance</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.LieuNaissance}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Adresse</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.Adresse}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Telephone</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.Tel}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Nationalite</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.Nationalite}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Filiere</Text>}>
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
