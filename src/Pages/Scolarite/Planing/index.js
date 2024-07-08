import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Dropdown, Menu, Typography, Input, Card, Row, Col, Form, Drawer, Descriptions, message, Modal, Select, DatePicker, TimePicker } from 'antd';
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
      const response = await axiosInstance.get('/api/planing', {
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
      showDeleteConfirm(record.ID_Planning);
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
      await axiosInstance.delete(`/api/planing/${id}`);
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
        title: <Text strong style={{ fontSize: '16px' }}>Classe</Text>,
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
        title: <Text strong style={{ fontSize: '16px' }}>Matiere</Text>,
        dataIndex: 'NomMatiere',
        key: 'NomMatiere',
        sorter: (a, b) => a.NomMatiere.localeCompare(b.NomMatiere),
        ...getColumnSearchProps('NomMatiere'),
        render: (text) => (
          <Text strong style={{ fontSize: '16px' }}>
            {renderText(text, globalSearchText)}
          </Text>
        ),
        ellipsis: true,
      },
  
  {
    title: <Text strong style={{ fontSize: '16px' }}>Salle</Text>,
    dataIndex: 'Nom',
    key: 'Nom',
    sorter: (a, b) => a.Nom.localeCompare(b.Nom),
    ...getColumnSearchProps('Nom'),
    render: (text) => (
      <Text strong style={{ fontSize: '16px' }}>
 {renderText(text, globalSearchText)}      </Text>
    ),
    ellipsis: true,
  },
  {
    title: <Text strong style={{ fontSize: '16px' }}>Jour</Text>,
    dataIndex: 'Jour',
    key: 'Jour',
    sorter: (a, b) => a.Jour.localeCompare(b.Jour),
    ...getColumnSearchProps('Jour'),
    render: (text) => (
      <Text strong style={{ fontSize: '16px' }}>
 {renderText(text, globalSearchText)}      </Text>
    ),
    ellipsis: true,
  },
  {
    title: <Text strong style={{ fontSize: '16px' }}>Heure Debut</Text>,
    dataIndex: 'HeureDebut',
    key: 'HeureDebut',
    sorter: (a, b) => a.HeureDebut.localeCompare(b.HeureDebut),
    ...getColumnSearchProps('HeureDebut'),
    render: (text) => (
      <Text strong style={{ fontSize: '16px' }}>
 {renderText(moment(text, 'HH:mm:ss').format('HH:mm'), globalSearchText)}      </Text>
    ),
    ellipsis: true,
  },
  {
    title: <Text strong style={{ fontSize: '16px' }}>Heure Fin</Text>,
    dataIndex: 'HeureFin',
    key: 'HeureFin',
    sorter: (a, b) => a.HeureFin.localeCompare(b.HeureFin),
    ...getColumnSearchProps('HeureFin'),
    render: (text) => (
      <Text strong style={{ fontSize: '16px' }}>
        {renderText(moment(text, 'HH:mm:ss').format('HH:mm'), globalSearchText)}
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
    title: <Text strong style={{ fontSize: '16px' }}>Nom Formateur</Text>,
    dataIndex: 'NomFormateur',
    key: 'NomFormateur',
    sorter: (a, b) => a.NomFormateur.localeCompare(b.NomFormateur),
    ...getColumnSearchProps('NomFormateur'),
    render: (text) => (
      <Text strong style={{ fontSize: '16px' }}>
        {renderText(text, globalSearchText)}
      </Text>
    ),
    ellipsis: true,
  },
  {
    title: <Text strong style={{ fontSize: '16px' }}>Prenom Formateur</Text>,
    dataIndex: 'PrenomFormateur',
    key: 'PrenomFormateur',
    sorter: (a, b) => a.PrenomFormateur.localeCompare(b.PrenomFormateur),
    ...getColumnSearchProps('PrenomFormateur'),
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
  
  const [salleOptions, setSalleOptions] = useState([]);
  useEffect(() => {
    const fetchSalleOptions = async () => {
      try {
        const response = await axiosInstance.get('/api/salle');
        setSalleOptions(response.data);
      } catch (error) {
        console.error('Error fetching filiere options:', error);
        message.error('Erreur lors du chargement des options de classe');
      }
    };

    fetchSalleOptions();
  }, []);

  const AddUserForm= () => {
    const [classeOptions, setClasseOptions] = useState([]);
    const [matiereOptions, setMatiereOptions] = useState([]);
    const [formateurOptions, setFormateurOptions] = useState([]);
    const [selectedClasse, setSelectedClasse] = useState(null);
    const [selectedMatiere, setSelectedMatiere] = useState(null);
    const [selectedFormateur, setSelectedFormateur] = useState(null);
  
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
      const fetchMatieres = async (classeId) => {
        try {
          const response = await axiosInstance.get(`/api/jointure/matiere-classe/${classeId}`);
          return response.data.map(matiere => ({
            id: matiere.ID_Matiere,
            label: matiere.NomMatiere        }));
        } catch (error) {
          console.error('Error fetching etudiant options:', error);
          return [];
        }
      };
  
      const updateMatiereOptions = async (classeId) => {
        if (classeId) {
          const matieres = await fetchMatieres(classeId);
          setMatiereOptions(matieres);
        } else {
          setMatiereOptions([]);
        }
      };
  
      updateMatiereOptions(selectedClasse);
    }, [selectedClasse]);
    
    useEffect(() => {
  
        const fetchFormateurs = async (formateurId) => {
          try {
            const response = await axiosInstance.get(`/api/jointure/formateur-matiere/${formateurId}`);
            return response.data.map(formateur => ({
              id: formateur.ID_Formateur,
              label: `${formateur.NomFormateur} ${formateur.PrenomFormateur}`       }));
          } catch (error) {
            console.error('Error fetching etudiant options:', error);
            return [];
          }
        };
  
      const updateFormateurOptions = async (formateurId) => {
        if (formateurId) {
          const formateurs = await fetchFormateurs(formateurId);
          setFormateurOptions(formateurs);
        } else {
          setFormateurOptions([]);
        }
      };
  
      updateFormateurOptions(selectedMatiere);
    }, [selectedMatiere]);
  
    const handleClasseChange = (value) => {
      setSelectedClasse(value);
      setSelectedMatiere(null);
    };
  
    const handleMatiereChange = (value) => {
      setSelectedMatiere(value);
    };
    const handleFormateurChange = (value) => {
      setSelectedFormateur(value);
    };
  
    const handleFormSubmit = async (values) => {
      try {
        const formData = {
          ...values,
          ID_Classe: selectedClasse,
          ID_Matiere: selectedMatiere,
          ID_Formateur: selectedFormateur
        };
        console.log(formData)
        await axiosInstance.post('/api/planing', formData);
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
  label={<Text strong style={{ fontSize: '16px' }}>Classe</Text>}
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
  label={<Text strong style={{ fontSize: '16px' }}>Matiere</Text>}
  rules={[{ required: true, message: 'Champ requis' }]}
>
  <Select
    showSearch
    filterOption={(input, option) =>
      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
    }
    style={{ fontSize: '16px' }}
    placeholder="Sélectionner un étudiant"
    onChange={handleMatiereChange}
    value={selectedMatiere}
    disabled={!selectedClasse}
  >
    {matiereOptions.map(matiere => (
      <Option style={{ fontSize: '16px' }} key={matiere.id} value={matiere.id}>{matiere.label}</Option>
    ))}
  </Select>
</Form.Item>
<Form.Item
  label={<Text strong style={{ fontSize: '16px' }}>Formateur</Text>}
  rules={[{ required: true, message: 'Champ requis' }]}
>
  <Select
    showSearch
    filterOption={(input, option) =>
      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
    }
    style={{ fontSize: '16px' }}
    placeholder="Sélectionner un étudiant"
    onChange={handleFormateurChange}
    value={selectedFormateur}
    disabled={!selectedMatiere}
  >
    {formateurOptions.map(formateur => (
      <Option style={{ fontSize: '16px' }} key={formateur.id} value={formateur.id}>{formateur.label}</Option>
    ))}
  </Select>
</Form.Item>
<Form.Item
        name="ID_Salle"
        label={<Text strong style={{ fontSize: '16px' }}>Salle</Text>}
        rules={[{ required: true, message: 'Veuillez sélectionner etudiant' }]}
        style={{ fontSize: '16px' }}
      >
        <Select
          style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
          placeholder="Sélectionner un etudiant"
        >
          {salleOptions.map(salle => (
            <Option key={salle.ID_Salle} value={salle.ID_Salle} style={{ fontSize: '16px' }}>
              {salle.Nom}
            </Option>
          ))}
        </Select>
      </Form.Item>
   
      <Form.Item
  name="Jour"
  label={<Text strong style={{ fontSize: '16px' }}>Jour</Text>}
  rules={[{ required: true, message: 'Champ requis' }]}
>
  <Select style={{ fontSize: '16px' }}>
    <Option value="Lundi">Lundi</Option>
    <Option value="Mardi">Mardi</Option>
    <Option value="Mercredi">Mercredi</Option>
    <Option value="Jeudi">Jeudi</Option>
    <Option value="Vendredi">Vendredi</Option>
    <Option value="Samedi">Samedi</Option>
    <Option value="Dimanche">Dimanche</Option>
  </Select>
</Form.Item>
        <Form.Item

          name="HeureDebut"
          label={<Text strong style={{ fontSize: '16px' }}>Heure Début</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
        >
          <TimePicker             format="HH:mm" 
 type="time" style={{ fontSize: '16px' }} />
        </Form.Item>
        <Form.Item
          name="HeureFin"
          label={<Text strong style={{ fontSize: '16px' }}>Heure Fin</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
        >
          <TimePicker             format="HH:mm" 
 type="time" style={{ fontSize: '16px' }} />
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
  const [matiereOptions, setMatiereOptions] = useState([]);
  const [formateurOptions, setFormateurOptions] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [selectedFormateur, setSelectedFormateur] = useState(null);

 // Format date to yyyy-MM-dd
 const formatDate = (date) => {
  return moment(date).format('HH:mm');
};
  // Function to get initial values excluding sensitive fields
  const getInitialValues = () => {
    const initialValues = { ...selectedRecord };
    initialValues.HeureDebut = formatDate(initialValues.HeureDebut);
    initialValues.HeureFin = formatDate(initialValues.HeureFin);

    return initialValues;
  };

  // Set initial form values when selectedRecord changes
  useEffect(() => {
    form.setFieldsValue(getInitialValues());
    setSelectedClasse(selectedRecord.ID_Classe);
    setSelectedMatiere(selectedRecord.ID_Matiere);
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

  useEffect(() => {
    const fetchMatieres = async (classeId) => {
      try {
        const response = await axiosInstance.get(`/api/jointure/matiere-classe/${classeId}`);
        return response.data.map(matiere => ({
          id: matiere.ID_Matiere,
          label: matiere.NomMatiere        }));
      } catch (error) {
        console.error('Error fetching etudiant options:', error);
        return [];
      }
    };

    const updateMatiereOptions = async (classeId) => {
      if (classeId) {
        const matieres = await fetchMatieres(classeId);
        setMatiereOptions(matieres);
      } else {
        setMatiereOptions([]);
      }
    };

    updateMatiereOptions(selectedClasse);
  }, [selectedClasse]);


  useEffect(() => {
  
    const fetchFormateurs = async (formateurId) => {
      try {
        const response = await axiosInstance.get(`/api/jointure/formateur-matiere/${formateurId}`);
        return response.data.map(formateur => ({
          id: formateur.ID_Formateur,
          label: `${formateur.NomFormateur} ${formateur.PrenomFormateur}`       }));
      } catch (error) {
        console.error('Error fetching etudiant options:', error);
        return [];
      }
    };

  const updateFormateurOptions = async (formateurId) => {
    if (formateurId) {
      const formateurs = await fetchFormateurs(formateurId);
      setFormateurOptions(formateurs);
    } else {
      setFormateurOptions([]);
    }
  };

  updateFormateurOptions(selectedMatiere);
}, [selectedMatiere]);


  
  const handleClasseChange = (value) => {
    setSelectedClasse(value);
    setSelectedMatiere(null);
  };

  const handleMatiereChange = (value) => {
    setSelectedMatiere(value);
  };

  const handleFormateurChange = (value) => {
    setSelectedFormateur(value);
  };

  // Handle form submission
  const handleFormSubmit = async (values) => {
    try {
      const formData = {
        ...selectedRecord,
        ...values,
        ID_Classe: selectedClasse,
        ID_Matiere: selectedMatiere,
        ID_Formateur: selectedFormateur

      };
      console.log('Form data being submitted:', formData);
      await axiosInstance.put(`/api/planing/${selectedRecord.ID_Planning}`, formData);
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
  label={<Text strong style={{ fontSize: '16px' }}>Classe</Text>}
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
  label={<Text strong style={{ fontSize: '16px' }}>Matiere</Text>}
  rules={[{ required: true, message: 'Champ requis' }]}
>
  <Select
    showSearch
    filterOption={(input, option) =>
      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
    }
    style={{ fontSize: '16px' }}
    placeholder="Sélectionner un étudiant"
    onChange={handleMatiereChange}
    value={selectedMatiere}
    disabled={!selectedClasse}
  >
    {matiereOptions.map(matiere => (
      <Option style={{ fontSize: '16px' }} key={matiere.id} value={matiere.id}>{matiere.label}</Option>
    ))}
  </Select>
</Form.Item>
<Form.Item
  label={<Text strong style={{ fontSize: '16px' }}>Formateur</Text>}
  rules={[{ required: true, message: 'Champ requis' }]}
>
  <Select
    showSearch
    filterOption={(input, option) =>
      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
    }
    style={{ fontSize: '16px' }}
    placeholder="Sélectionner un étudiant"
    onChange={handleFormateurChange}
    value={selectedFormateur}
    disabled={!selectedMatiere}
  >
    {formateurOptions.map(formateur => (
      <Option style={{ fontSize: '16px' }} key={formateur.id} value={formateur.id}>{formateur.label}</Option>
    ))}
  </Select>
</Form.Item>
<Form.Item
        name="ID_Salle"
        label={<Text strong style={{ fontSize: '16px' }}>Salle</Text>}
        rules={[{ required: true, message: 'Veuillez sélectionner etudiant' }]}
        style={{ fontSize: '16px' }}
      >
        <Select
          style={{ fontSize: '16px', width: '100%', minHeight: '40px' }} // Adjust width and minHeight as needed
          placeholder="Sélectionner un etudiant"
        >
          {salleOptions.map(salle => (
            <Option key={salle.ID_Salle} value={salle.ID_Salle} style={{ fontSize: '16px' }}>
              {salle.Nom}
            </Option>
          ))}
        </Select>
      </Form.Item>
   
      <Form.Item
  name="Jour"
  label={<Text strong style={{ fontSize: '16px' }}>Jour</Text>}
  rules={[{ required: true, message: 'Champ requis' }]}
>
  <Select style={{ fontSize: '16px' }}>
    <Option value="Lundi">Lundi</Option>
    <Option value="Mardi">Mardi</Option>
    <Option value="Mercredi">Mercredi</Option>
    <Option value="Jeudi">Jeudi</Option>
    <Option value="Vendredi">Vendredi</Option>
    <Option value="Samedi">Samedi</Option>
    <Option value="Dimanche">Dimanche</Option>
  </Select>
</Form.Item>
        <Form.Item
          name="HeureDebut"
          label={<Text strong style={{ fontSize: '16px' }}>Heure Début</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
        >
          <TimePicker             format="HH:mm" 
 type="time" style={{ fontSize: '16px' }} />
        </Form.Item>
        <Form.Item
          name="HeureFin"
          label={<Text strong style={{ fontSize: '16px' }}>Heure Fin</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
        >
          <TimePicker             format="HH:mm" 
 type="time" style={{ fontSize: '16px' }} />
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
          <Title level={3} style={{ fontSize: '24px' }}>Listes des emplois du temps</Title>
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
                  Ajouter un emploi du temps
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
 {drawerType === 'add' ? 'Ajouter emploi du temps ' : drawerType === 'edit' ? 'Modifier emploi du temps' : 'Afficher emploi du temps'}

    </Text>
  }
  width={drawerType === 'view' ? 720 : 480}
  onClose={handleCloseDrawer}
  visible={drawerVisible}
  bodyStyle={{ paddingBottom: 80 }}
>
  {drawerType === 'view' ? (
    <Descriptions column={1} bordered>
        <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Classe</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.NomClasse}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Matiere</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.NomMatiere}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Salle</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.Nom}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Jour</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.Jour}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Heure Debut</Text>}>
        <Text style={{ fontSize: '16px' }}>{moment(selectedRecord?.HeureDebut, 'HH:mm:ss').format('HH:mm')}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Heure Fin</Text>}>
        <Text style={{ fontSize: '16px' }}>{moment(selectedRecord?.HeureFin, 'HH:mm:ss').format('HH:mm')}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Nb Heure</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.Nb_Heure}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Nom Formateur</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.NomFormateur}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Prenom Formateur</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord?.PrenomFormateur}</Text>
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
