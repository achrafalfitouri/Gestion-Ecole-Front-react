import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Dropdown, Menu, Typography, Input, Card, Row, Col, Form, Drawer, Descriptions, message, Modal, Select, InputNumber } from 'antd';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined,  RedoOutlined, SearchOutlined} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import axiosInstance from '../../../Middleware/axiosInstance';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoImage from '../../Finance/Facture/LOGO-EHPM.png';


const { Title, Text } = Typography;
const { Option } = Select;


const CrudTable = () => {
  const [data, setData] = useState(null);
  const [data2, setData2] = useState(null);
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


  const [nbSeance, setNbSeance] = useState(0);

  const handlePrint = () => {
    const doc = new jsPDF();
    const tableColumn = ['Etudiant', 'Filiere', 'Groupe'];
    for (let i = 1; i <= nbSeance; i++) {
      tableColumn.push(`S${i}`);
    }

    const tableRows = selectedRecord.NomComplet.split('\n').map((student, index) => {
      const row = [student, selectedRecord.NomFiliere, selectedRecord.Groupe];
      for (let i = 1; i <= nbSeance; i++) {
        row.push('');
      }
      return row;
    });

    // Add logo (assuming EHPM is a text logo)
    doc.addImage(logoImage, 'PNG', 5, 1, 60, 40);

    const nomClasse = selectedRecord.NomClasse;
    const niveau = selectedRecord.Niveau;
   
    // Set font size and style for logo text
    doc.setFontSize(24); // Adjust the font size here (bigger)
    doc.setFont('helvetica', 'bold'); // Set the font and style to bold

    // Position logo text at the top left
   

    // Set font size for class and level
    doc.setFontSize(12);
    
    // Add Classe | Niveau below the logo text
    doc.text(`Classe: ${nomClasse} | Niveau: ${niveau}`, 10, 55);

    // Add table
    doc.autoTable(tableColumn, tableRows, { startY: 60 });

    // Add Annee Scolaire at the bottom center
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    const middleX = pageWidth / 2;
    const bottomY = pageHeight - 10;

    doc.setFontSize(12);
    doc.text('Annee Scolaire: ' + selectedRecord.AnneeScolaire, middleX, bottomY, { align: 'center' });

    // Save PDF
    doc.save('liste_de_presence.pdf');
  };




  
  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  const fetchData = async () => {
    setRefreshLoading(true);
    try {
        const response = await axiosInstance.get('/api/classes', {
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
  const fetchData2 = async () => {
    setRefreshLoading(true);
    try {
        const response = await axiosInstance.get('/api/classes/all', {
            params: {
                page: pagination.current,
                pageSize: pagination.pageSize,
            },
        });


      
            setData2(response.data);
       

        setPagination({ ...pagination, total: response.data.total });
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        setRefreshLoading(false);
    }
};

useEffect(() => {
  fetchData2();
}, [pagination.current, pagination.pageSize]);




  const handleMenuClick = (record, action) => {
    setSelectedRecord(record);
    if (action === 'edit') {
      setDrawerType('edit');
      setDrawerVisible(true);
    } else if (action === 'delete') {
      showDeleteConfirm(record.ID_Classe);
    } else if (action === 'view') {
      setDrawerType('view');
      setDrawerVisible(true);
      fetchData()
    }
  };

  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cette classe ?',
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
      await axiosInstance.delete(`/api/classes/${id}`);
      message.success('classe supprimé avec succès');
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
  const menu2 = (record) => (
    <Menu onClick={({ key }) => handleMenuClick(record, key)}>
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

      title: <Text strong style={{ fontSize: '16px' }}>Nom de classe</Text>,
      dataIndex: 'NomClasse',
      key: 'NomClasse',
      sorter: (a, b) => a.NomClasse.localeCompare(b.NomClasse),
      ...getColumnSearchProps('NomClasse'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {

      title: <Text strong style={{ fontSize: '16px' }}>Groupe</Text>,
      dataIndex: 'Groupe',
      key: 'Groupe',
      sorter: (a, b) => a.Groupe.localeCompare(b.Groupe),
      ...getColumnSearchProps('Groupe'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {

      title: <Text strong style={{ fontSize: '16px' }}>Niveau</Text>,
      dataIndex: 'Niveau',
      key: 'Niveau',
      sorter: (a, b) => a.Niveau.localeCompare(b.Niveau),
      ...getColumnSearchProps('Niveau'),
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

      title: <Text strong style={{ fontSize: '16px' }}>Annee Scolaire</Text>,
      dataIndex: 'AnneeScolaire',
      key: 'AnneeScolaire',
      sorter: (a, b) => a.AnneeScolaire.localeCompare(b.AnneeScolaire),
      ...getColumnSearchProps('AnneeScolaire'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {

      title: <Text strong style={{ fontSize: '16px' }}>Remarques</Text>,
      dataIndex: 'Remarques',
      key: 'Remarques',
      sorter: (a, b) => a.Remarques.localeCompare(b.Remarques),
      ...getColumnSearchProps('Remarques'),
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
  const columns2 = [
  
    {

      title: <Text strong style={{ fontSize: '16px' }}>Nom de classe</Text>,
      dataIndex: 'NomClasse',
      key: 'NomClasse',
      sorter: (a, b) => a.NomClasse.localeCompare(b.NomClasse),
      ...getColumnSearchProps('NomClasse'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {

      title: <Text strong style={{ fontSize: '16px' }}>Groupe</Text>,
      dataIndex: 'Groupe',
      key: 'Groupe',
      sorter: (a, b) => a.Groupe.localeCompare(b.Groupe),
      ...getColumnSearchProps('Groupe'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {

      title: <Text strong style={{ fontSize: '16px' }}>Niveau</Text>,
      dataIndex: 'Niveau',
      key: 'Niveau',
      sorter: (a, b) => a.Niveau.localeCompare(b.Niveau),
      ...getColumnSearchProps('Niveau'),
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

      title: <Text strong style={{ fontSize: '16px' }}>Annee Scolaire</Text>,
      dataIndex: 'AnneeScolaire',
      key: 'AnneeScolaire',
      sorter: (a, b) => a.AnneeScolaire.localeCompare(b.AnneeScolaire),
      ...getColumnSearchProps('AnneeScolaire'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {

      title: <Text strong style={{ fontSize: '16px' }}>Remarques</Text>,
      dataIndex: 'Remarques',
      key: 'Remarques',
      sorter: (a, b) => a.Remarques.localeCompare(b.Remarques),
      ...getColumnSearchProps('Remarques'),
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
        <Dropdown overlay={menu2(record)} trigger={['click']}>
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
        await axiosInstance.post('/api/classes', values);
        message.success('classe ajouté avec succès');
      } else if (drawerType === 'edit' && selectedRecord) {
        const updatedValues = { ...selectedRecord, ...values }; // Ensure ID is included
        await axiosInstance.put(`/api/classes/${selectedRecord.ID_Classe}`, updatedValues);
        message.success('classe modifié avec succès');
      }

      handleCloseDrawer();
      fetchData(); // Refresh data after submission
      fetchData2(); // Refresh data after submission
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
      fetchData2();
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
        console.error('Error fetching classes options:', error);
        message.error('Erreur lors du chargement des options de filiere');
      }
    };

    fetchFiliereOptions();
  }, []);
  
  const [anneescolaireOptions, setAnneescolaireOptions] = useState([]);
  useEffect(() => {
    const fetchAnneescolaireOptions = async () => {
      try {
        const response = await axiosInstance.get('/api/anneescolaire');
        setAnneescolaireOptions(response.data);
      } catch (error) {
        console.error('Error fetching classes options:', error);
        message.error('Erreur lors du chargement des options de filiere');
      }
    };

    fetchAnneescolaireOptions();
  }, []);
  
  // Add Form Component for Ajouter Utilisateur
  const AddUserForm = () => (
    <Form layout="vertical" onFinish={handleFormSubmit}>


<Form.Item
    name="NomClasse"
    label={<Text strong style={{ fontSize: '16px' }}>Nom de classe</Text>}
    rules={[{ required: true, message: 'Champ requis' }]}
  >
    <Input placeholder="Entrez le nom de la classe" style={{ fontSize: '16px' }} />
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
  <Form.Item
        name="Groupe"
        label={<Text strong style={{ fontSize: '16px' }}>Groupe</Text>}
        rules={[{ required: true, message: 'Veuillez sélectionner Groupe' }]}
        style={{ fontSize: '16px' }}
      >
        <Select
        showSearch
        filterOption={(input, option) =>
          (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
        }
          style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
          placeholder="Sélectionner un Groupe"
        >
<Option value="G1">G1</Option>
  <Option value="G2">G2</Option>
  <Option value="G3">G3</Option>
  <Option value="G4">G4</Option>        </Select>
      </Form.Item>
  <Form.Item
        name="ID_AnneeScolaire"
        label={<Text strong style={{ fontSize: '16px' }}>Annee Scolaire</Text>}
        rules={[{ required: true, message: 'Veuillez sélectionner ' }]}
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
          {anneescolaireOptions.map(anneescolaire => (
            <Option key={anneescolaire.ID_AnneeScolaire} value={anneescolaire.ID_AnneeScolaire} style={{ fontSize: '16px' }}>
              {anneescolaire.AnneeScolaire}
            </Option>
          ))}
        </Select>
      </Form.Item>
    

<Form.Item
    name="Remarques"
    label={<Text strong style={{ fontSize: '16px' }}>Remarques</Text>}
    rules={[{ required: true, message: 'Champ requis' }]}
  >
    <Input placeholder="Entrez le nom de la classe" style={{ fontSize: '16px' }} />
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
    name="NomClasse"
    label={<Text strong style={{ fontSize: '16px' }}>Nom de classe</Text>}
  >
    <Input placeholder="Entrez le nom de la classe" style={{ fontSize: '16px' }} />
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
      <Form.Item
        name="Groupe"
        label={<Text strong style={{ fontSize: '16px' }}>Groupe</Text>}
        style={{ fontSize: '16px' }}
      >
        <Select
        showSearch
        filterOption={(input, option) =>
          (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
        }
          style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
          placeholder="Sélectionner un Groupe"
        >
<Option value="G1">G1</Option>
  <Option value="G2">G2</Option>
  <Option value="G3">G3</Option>
  <Option value="G4">G4</Option>        </Select>
      </Form.Item>
  <Form.Item
        name="ID_AnneeScolaire"
        label={<Text strong style={{ fontSize: '16px' }}>Annee Scolaire</Text>}
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
          {anneescolaireOptions.map(anneescolaire => (
            <Option key={anneescolaire.ID_AnneeScolaire} value={anneescolaire.ID_AnneeScolaire} style={{ fontSize: '16px' }}>
              {anneescolaire.AnneeScolaire}
            </Option>
          ))}
        </Select>
      </Form.Item>
    

<Form.Item
    name="Remarques"
    label={<Text strong style={{ fontSize: '16px' }}>Remarques</Text>}
  >
    <Input placeholder="Entrez le nom de la classe" style={{ fontSize: '16px' }} />
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
          <Title level={3} style={{ fontSize: '24px' }}>Liste des classes</Title>
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
                  Ajouter une classe
                </Button>
              </Space>
            </Col>
          </Row>
          

<Title level={3} style={{ fontSize: '20px' }}>Liste des classes qui n'avaient pas encore d'étudiants</Title><br/>

          <Table columns={columns2} dataSource={data2} rowKey="ID_Classe" pagination={pagination} loading={refreshLoading}
            onChange={handleTableChange}  scroll={{ x: 'max-content' }} // This helps with horizontal scrolling if the table is too wide
            size="middle" // Optionally change the size of the table (default, middle, small)
            rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}   />
            <Title level={3} style={{ fontSize: '20px' }}>Liste des classes qui avaient des étudiants</Title><br/>

<Table columns={columns} dataSource={data} rowKey="ID_Classe" pagination={pagination} loading={refreshLoading}
  onChange={handleTableChange}  scroll={{ x: 'max-content' }} // This helps with horizontal scrolling if the table is too wide
  size="middle" // Optionally change the size of the table (default, middle, small)
  rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}   />

        </Space>
      </Card>

      <Drawer
  title={
    <Text strong style={{ fontSize: '22px' }}>
      {drawerType === 'add' ? 'Ajouter classe' : drawerType === 'edit' ? 'Modifier classe' : 'Afficher classe'}
    </Text>
  }
  width={drawerType === 'view' ? 720 : 480}
  onClose={handleCloseDrawer}
  visible={drawerVisible}
  bodyStyle={{ paddingBottom: 80 }}
>
  {drawerType === 'view' && selectedRecord && (
    <Descriptions column={1} bordered>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Nom Classe</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.NomClasse}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Filiere</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.NomFiliere}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Groupe</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.Groupe}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Niveau</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.Niveau}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Annee Scolaire</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.AnneeScolaire}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Remarques</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.Remarques}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Liste Etudiants</Text>}>
        <Button
          icon={<EyeOutlined />}
          onClick={() => {
            // Open a drawer to show students
            setDrawerType('listEtudiants');
            setDrawerVisible(true);
          }}
          style={{ fontWeight: 'bold', fontSize: '14px' }}
        >
          Voir Liste Etudiants
        </Button>
      </Descriptions.Item>
    </Descriptions>
  )}

{drawerType === 'listEtudiants' && (
      <Drawer
      
        title={<Text strong style={{ fontSize: '22px' }}>Liste des Etudiants</Text>}
        width={920}
        onClose={handleCloseDrawer}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <div>
          {selectedRecord && (
            <>
              <Descriptions
                bordered
                column={5}
                layout="vertical"
                style={{ width: '100%', border: '1px solid #f0f0f0' }}
              >
                <Descriptions.Item
                  label={<Text strong style={{ fontSize: '16px' }}>(Numero) Etudiant </Text>}
                  contentStyle={{ fontSize: '16px' }}
                >
                  <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {selectedRecord.NomComplet.split('\n').map((student, index) => (
                      <div key={index} style={{ borderBottom: '1px solid #ddd', padding: '5px 0' }}>
                        {student}
                      </div>
                    ))}
                  </pre>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Text strong style={{ fontSize: '16px' }}>Filiere</Text>}
                  contentStyle={{ fontSize: '16px' }}
                >
                  {selectedRecord.NomFiliere}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Text strong style={{ fontSize: '16px' }}>Groupe</Text>}
                  contentStyle={{ fontSize: '16px' }}
                >
                  {selectedRecord.Groupe}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Text strong style={{ fontSize: '16px' }}>Niveau</Text>}
                  contentStyle={{ fontSize: '16px' }}
                >
                  {selectedRecord.Niveau}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Text strong style={{ fontSize: '16px' }}>Annee Scolaire</Text>}
                  contentStyle={{ fontSize: '16px' }}
                >
                  {selectedRecord.AnneeScolaire}
                </Descriptions.Item>
              </Descriptions>
              <div style={{ marginTop: 20 }}>
                <Text strong style={{ fontSize: '16px' }}>Nombre de Séances:</Text>
                <InputNumber min={1} max={20} value={nbSeance} onChange={setNbSeance} style={{ marginLeft: 10 }} />
                <Button type="primary" onClick={handlePrint}style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px',marginRight: '10px',marginLeft: 20 }} >Creer une liste de présence</Button>
              </div>
            </>
          )}
        </div>
      </Drawer>
    )}


  {drawerType === 'add' && <AddUserForm />}
  {drawerType === 'edit' && <EditUserForm />}
</Drawer>

    </div>

  );
};

export default CrudTable;
