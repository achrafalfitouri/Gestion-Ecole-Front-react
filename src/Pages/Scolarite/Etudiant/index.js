import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Dropdown, Menu, Typography, Input, Card, Row, Col, Form, Drawer, Descriptions, message, Modal, Select, Upload, DatePicker } from 'antd';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined, PlusOutlined, RedoOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import axiosInstance from '../../../Middleware/axiosInstance';
import moment from 'moment';
import dayjs from 'dayjs';

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
      title: 'Êtes-vous sûr de vouloir supprimer etudiant?',
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
      title: <Text strong style={{ fontSize: '16px' }}>Email</Text>,
      dataIndex: 'Email',
      key: 'Email',
      sorter: (a, b) => a.Email.localeCompare(b.Email),
      ...getColumnSearchProps('Email'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {
      title: <Text strong style={{ fontSize: '16px' }}>CIN</Text>,
      dataIndex: 'CIN',
      key: 'CIN',
      sorter: (a, b) => a.CIN.localeCompare(b.CIN),
      ...getColumnSearchProps('CIN'),
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
    formData.append('Email', values.Email);
    formData.append('CIN', values.CIN);
  
    // Check if a file is selected before appending
    if (fileList.length > 0) {
      formData.append('PhotoProfil', fileList[0].originFileObj);
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
            name="PhotoProfil"
            label={<Text strong style={{ fontSize: '16px' }}>Photo</Text>}

          >
            <Upload
        listType="picture-circle"
        fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              beforeUpload={() => false}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Télécharger</div>
                </div>
              )}
            </Upload>
            <Modal visible={previewOpen} footer={null} onCancel={handleCancel}>
              <img alt="PhotoProfil" style={{ width: '100%' }} src={previewImage} />
            </Modal>
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
        name="Email"
        label={<Text strong style={{ fontSize: '16px' }}>Email</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input type='email'  placeholder="Entrez l'email de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="CIN"
        label={<Text strong style={{ fontSize: '16px' }}>CIN</Text>}
        rules={[{ required: true, message: 'Champ requis' }]}
      >
        <Input  placeholder="Entrez le CIN de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
  name="Sexe"
  label={<Text strong style={{ fontSize: '16px' }}>Sexe</Text>}
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
        <DatePicker  placeholder="Entrez la date de naissance de l'etudiant" style={{ fontSize: '16px',width : '100%' }} />
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
         showSearch
         filterOption={(input, option) =>
           (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
         }
          style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
          placeholder="Sélectionner une filiere"
        >
          {filiereOptions.map(filiere => (
            <Option key={filiere.ID_Filiere} value={filiere.ID_Filiere} style={{ fontSize: '16px' }}>
              {filiere.NomFiliere}
            </Option>
          ))}
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
   initialValues.DateNaissance = dayjs(initialValues.DateNaissance);

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
            name="PhotoProfil"
            label={<Text strong style={{ fontSize: '16px' }}>Photo</Text>}

          >
            <Upload
        listType="picture-circle"
        fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              beforeUpload={() => false}
              
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Télécharger</div>
                </div>
              )}
            </Upload>
            <Modal visible={previewOpen} footer={null} onCancel={handleCancel}>
              <img alt="PhotoProfil" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </Form.Item>
        <Form.Item
        name="NumEtudiant"
        label={<Text strong style={{ fontSize: '16px' }}>Numero</Text>}
      >
        <Input placeholder="Entrez le numero de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="NomEtudiant"
        label={<Text strong style={{ fontSize: '16px' }}>Nom</Text>}
      >
        <Input placeholder="Entrez le nom de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="PrenomEtudiant"
        label={<Text strong style={{ fontSize: '16px' }}>Prenom</Text>}
      >
        <Input  placeholder="Entrez le prenom de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="Email"
        label={<Text strong style={{ fontSize: '16px' }}>Email</Text>}
      >
        <Input type='email'  placeholder="Entrez l'email de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="CIN"
        label={<Text strong style={{ fontSize: '16px' }}>CIN</Text>}
      >
        <Input  placeholder="Entrez le CIN de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
  name="Sexe"
  label={<Text strong style={{ fontSize: '16px' }}>Sexe</Text>}
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
      >
        <DatePicker   placeholder="Entrez la date de naissance de l'etudiant" style={{ fontSize: '16px',width: "100%" }} />
      </Form.Item>
     
      <Form.Item
        name="LieuNaissance"
        label={<Text strong style={{ fontSize: '16px' }}>Lieu de Naissance</Text>}
      >
        <Input  placeholder="Entrez le lieu de naissance de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      
      <Form.Item
        name="Adresse"
        label={<Text strong style={{ fontSize: '16px' }}>Adresse</Text>}
      >
        <Input  placeholder="Entrez l'Adresse de l'etudiant" style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="Tel"
        label={<Text strong style={{ fontSize: '16px' }}>Telephone</Text>}
      >
        <Input  placeholder="Entrez le telephpne " style={{ fontSize: '16px' }} />
      </Form.Item>
      <Form.Item
        name="Nationalite"
        label={<Text strong style={{ fontSize: '16px' }}>Nationalite</Text>}
      >
        <Input  placeholder="Entrez la Nationalite " style={{ fontSize: '16px' }} />
      </Form.Item>
      
      <Form.Item
        name="ID_Filiere"
        label={<Text strong style={{ fontSize: '16px' }}>Filiere</Text>}
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
          {filiereOptions.map(filiere => (
            <Option key={filiere.ID_Filiere} value={filiere.ID_Filiere} style={{ fontSize: '16px' }}>
              {filiere.NomFiliere}
            </Option>
          ))}
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
  width={drawerType === 'view' ? 720 : 480}
  onClose={handleCloseDrawer}
  visible={drawerVisible}
  bodyStyle={{ paddingBottom: 80 }}
>
  {drawerType === 'view' ? (
    
    <Descriptions column={1} bordered>
    <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Photo De Profil</Text>}>
      <div style={{ textAlign: 'center' }}>
        <img
          src={`http://localhost:3000/api/etud/photo/${selectedRecord?.ID_Etudiant}`}
          alt="PhotoProfil"
          style={{ width: '100px', height: '100px', borderRadius: '50%', cursor: 'pointer' }}
          onClick={toggleModal}
        />
      </div>
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
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.NomFiliere}</Text>
      </Descriptions.Item>
    </Descriptions>
  ) : (
    <>
      {drawerType === 'add' && <AddUserForm />}
      {drawerType === 'edit' && <EditUserForm />}
    </>
  )}

<Modal
        title="Photo De Profil"
        visible={visibleModal}
        onCancel={toggleModal}
        footer={null}
        width={600}
        centered
      >
        <img
          src={`http://localhost:3000/api/etud/photo/${selectedRecord?.ID_Etudiant}`}
          alt="PhotoProfil"
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
        />
      </Modal>
</Drawer>

    </div>
  );
};

export default CrudTable;
