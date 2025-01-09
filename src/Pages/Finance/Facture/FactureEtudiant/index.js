import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Dropdown, Menu, Typography, Input, Card, Row, Col, Form, Drawer, Descriptions, message, Modal, Select, InputNumber, DatePicker } from 'antd';
import { CheckCircleOutlined, CheckOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined,  MinusCircleOutlined,  PlusCircleOutlined,  PlusOutlined,  RedoOutlined, SearchOutlined} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import axiosInstance from '../../../../Middleware/axiosInstance';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import dayjs from 'dayjs';
import logoImage from '../LOGO-EHPM.png';
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

  const handlePrint = () => {
    const doc = new jsPDF();

    // Add EHPM Logo
    doc.addImage(logoImage, 'PNG', 5, 1, 60, 40);

    // Supplier Information
    const { NomEtudiant, PrenomEtudiant, Adresse, Tel, Email, TypeFacture, DateFacture, ID_Facture, MontantTotal, SousMontant, Reste, Montant, NomFiliere } = selectedRecord;
    const AdresseEHPM = '123 EHPM St, City, Country'; // Replace with actual address

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Etudiant:', 10, 54);
    doc.setFont('helvetica', 'normal');
    doc.text(`${NomEtudiant || ''} ${PrenomEtudiant || ''}`, 40, 54);

    doc.setFont('helvetica', 'bold');
    doc.text('Adresse:', 10, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(Adresse || '', 40, 62);

    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 10, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(Email || '', 40, 70);

    doc.setFont('helvetica', 'bold');
    doc.text('Tel:', 10, 78);
    doc.setFont('helvetica', 'normal');
    doc.text(Tel || '', 40, 78);

    doc.setFont('helvetica', 'bold');
    doc.text('Facture:', 10, 86);
    doc.setFont('helvetica', 'normal');
    doc.text(TypeFacture || '', 40, 86);

    // Invoice details on the right
    const dateFactureFormatted = dayjs(DateFacture).format('DD/MM/YYYY');
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 150, 20);
    doc.setFont('helvetica', 'normal');
    doc.text(`Facture N°: ${ID_Facture || ''}`, 150, 30);
    doc.text(`Date: ${dateFactureFormatted}`, 150, 38);

    // Table Headers
    const tableColumn = ['NOM', 'PRENOM', 'FILIERE'];

    // Table Rows
    const tableRows = [
        [NomEtudiant || '', PrenomEtudiant || '', NomFiliere || '']
    ];

    // Adding Table
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 100,
        theme: 'grid',
        headStyles: { fillColor: [0, 21, 41] }, // Professional color
        styles: {
            halign: 'center',
            valign: 'middle',
            fontSize: 12
        },
        columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 60 },
            2: { cellWidth: 60 }
        }
    });

    // Calculate totals
    const totalMontant = parseFloat(SousMontant || 0).toFixed(2);
    const reste = parseFloat(Reste || 0).toFixed(2);
    const finalMontant = parseFloat(MontantTotal || 0).toFixed(2);

    // Draw totals section
    const startY = doc.autoTable.previous.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);

    doc.text('Total PAYE:', 96, startY);
    doc.text(`${totalMontant} DH`, 150, startY);

    doc.text('RESTE:', 96, startY + 10);
    doc.text(`${reste} DH`, 150, startY + 10);

    doc.text('TOTAL:', 96, startY + 20);
    doc.text(`${finalMontant} DH`, 150, startY + 20);

    // Draw borders for totals section
    doc.rect(74, startY - 5, 120, 30); // Adjust the position and size as needed

    const cachetY = 180; // Adjust based on your layout

    // First border (Cachet)
    doc.rect(116, cachetY, 70, 40);

    // Second border (Signature)
    doc.rect(20, cachetY, 70, 40);

    // Create cut effect (white rectangle)
    doc.setFillColor(255, 255, 255); // White color for cutting
    doc.rect(120, cachetY - 5, 40, 10, 'F'); // White rectangle for cutting
    doc.rect(40, cachetY - 5, 40, 10, 'F'); // White rectangle for cutting

    // Add "Cachet" text
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Cachet', 133, cachetY + 3);

    // Add "Signature" text
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Signature', 46, cachetY + 3);

    // Footer with Date and Address
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const bottomY = pageHeight - 20; // Adjust the bottom margin
    doc.setFont('helvetica', 'normal');
    doc.text(`Adresse EHPM: ${AdresseEHPM}`, 10, bottomY - 10);
    doc.text(`Date Facture: ${dateFactureFormatted}`, 10, bottomY);

    // Save PDF
    doc.save('facture.pdf');
};


  const fetchData = async () => {
    setRefreshLoading(true);
    try {
        const response = await axiosInstance.get('/api/factures/etud', {
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
 
useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  const handleMenuClick = (record, action) => {
    setSelectedRecord(record);
    if (action === 'edit') {
      setDrawerType('edit');
      setDrawerVisible(true);
    } else if (action === 'delete') {
      showDeleteConfirm(record.ID_Facture);
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
      await axiosInstance.delete(`/api/factures/${id}`);
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

      title: <Text strong style={{ fontSize: '16px' }}>Type Facture</Text>,
      dataIndex: 'TypeFacture',
      key: 'TypeFacture',
      sorter: (a, b) => a.TypeFacture.localeCompare(b.TypeFacture),
      ...getColumnSearchProps('TypeFacture'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {renderText(text, globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
    {

      title: <Text strong style={{ fontSize: '16px' }}>Date Facture</Text>,
      dataIndex: 'DateFacture',
      key: 'DateFacture',
      sorter: (a, b) => a.DateFacture.localeCompare(b.DateFacture),
      ...getColumnSearchProps('DateFacture'),
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
        {renderText(moment(text).format('DD/MM/YYYY'), globalSearchText)}
        </Text>
      ),
      ellipsis: true,
    },
   
    
    {
        title: <Text strong style={{ fontSize: '16px' }}>Montant</Text>,
        dataIndex: 'SousMontant',
        key: 'SousMontant',
        sorter: (a, b) => {
          if (typeof a.SousMontant === 'number' && typeof b.SousMontant === 'number') {
            return a.SousMontant - b.SousMontant;
          }
          return a.SousMontant.toString().localeCompare(b.SousMontant.toString());
        },
        ...getColumnSearchProps('SousMontant'),
        render: (text) => (
          <Text strong style={{ fontSize: '16px' }}>
            {renderText(text, globalSearchText)} DH
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
            {renderText(text, globalSearchText)} DH
          </Text>
        ),
        ellipsis: true,
      },

    

    {
        title: <Text strong style={{ fontSize: '16px' }}>Total</Text>,
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
        // Poster la facture et récupérer l'ID de la facture créée
       await axiosInstance.post('/api/factures', values);
     
     
        message.success('Facture ajoutée avec succès');
      } else if (drawerType === 'edit' && selectedRecord) {
        const updatedValues = { ...selectedRecord, ...values }; // Ensure ID is included
        await axiosInstance.put(`/api/factures/${selectedRecord.ID_Facture}`, updatedValues);
        message.success('Facture modifiée avec succès');
      }
  
      handleCloseDrawer();
      fetchData(); // Refresh data after submission
    } catch (error) {
      console.error('Error saving data:', error);
      message.error('Erreur lors de l\'enregistrement des données');
    }
  };
  
  // Le reste du code reste inchangé
  
// Le reste du code reste inchangé

// Le reste du code reste inchangé

  

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
 



  
  const AddUserForm = () => {
    const [form] = Form.useForm();
    const [etudiantOptions, setEtudiantOptions] = useState([]);
    const [paiementOptions, setPaiementOptions] = useState([]);
    const [selectedEtudiant, setSelectedEtudiant] = useState(null);
    const [datapaiement, setDataPaiement] = useState(null);
    const [selectedPaiement, setSelectedPaiement] = useState(null);
  
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
  
    const fetchPaiement = async (etudiantId) => {
      try {
        const response = await axiosInstance.get(`/api/jointure/paiement-etudiant/${etudiantId}`);
        return response.data.map(paiement => ({
          id: paiement.ID_PaiementEtudiants,
          label: `${paiement.NomEtudiant} ${paiement.PrenomEtudiant} : EHPM-PAIE-${paiement.ID_PaiementEtudiants}`,
          Montant: paiement.Montant,
          Reste: paiement.Reste,
          MontantTotal: paiement.MontantTotal,
        }));
      } catch (error) {
        console.error('Error fetching paiement options:', error);
        return [];
      }
    };
  
    const updatePaiementOptions = async (etudiantId) => {
      if (etudiantId) {
        const paiement = await fetchPaiement(etudiantId);
        setPaiementOptions(paiement);
      } else {
        setPaiementOptions([]);
      }
    };
  
    useEffect(() => {
      updatePaiementOptions(selectedEtudiant);
    }, [selectedEtudiant]);
  
    const handleEtudiantChange = (value) => {
      setSelectedPaiement(value);
      const selectedPaiementDetails = paiementOptions.find(paiement => paiement.id === value);
      setDataPaiement(selectedPaiementDetails);
    };
  
   
  
    useEffect(() => {
      if (datapaiement) {
        form.setFieldsValue({
          SousMontant: datapaiement.Montant,
          Reste: datapaiement.Reste,
          Montant: datapaiement.MontantTotal,
      
        });
        console.log(datapaiement.MontantTotal)
      }
    }, [datapaiement, form]);
  
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="ID_Etudiant"
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
            onChange={setSelectedEtudiant}
          >
            {etudiantOptions.map(etudiant => (
              <Option style={{ fontSize: '16px' }} key={etudiant.id} value={etudiant.id}>{etudiant.label}</Option>
            ))}
          </Select>
        </Form.Item>
  
        <Form.Item
          name='ID_PaiementEtudiants'
          label={<Text strong style={{ fontSize: '16px' }}>Paiement</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            style={{ fontSize: '16px' }}
            placeholder="Sélectionner un paiement"
            onChange={handleEtudiantChange}
            value={selectedPaiement}
            disabled={!selectedEtudiant}
          >
            {paiementOptions.map(paiement => (
              <Option style={{ fontSize: '16px' }} key={paiement.id} value={paiement.id}>{paiement.label}</Option>
            ))}
          </Select>
        </Form.Item>
  
        <Form.Item
          name="DateFacture"
          label={<Text strong style={{ fontSize: '16px' }}>Date Facture</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
          style={{ fontSize: '16px', width: '100%', fontWeight: "bold", minHeight: '40px' }}
          placeholder="Entrez la date de la facture"
        >
          <DatePicker style={{ fontSize: '16px', width: '100%' }} />
        </Form.Item>
  
        <Form.Item
          name="TypeFacture"
          label={<Text strong style={{ fontSize: '16px' }}>Type Facture</Text>}
          rules={[{ required: true, message: 'Veuillez sélectionner un groupe' }]}
          style={{ fontSize: '16px', width: '100%', fontWeight: "bold", minHeight: '40px' }}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            placeholder="Sélectionner un groupe"
          >
            <Option style={{ fontSize: '16px' }} value="Entree">Entrée</Option>
            <Option style={{ fontSize: '16px' }} value="Sortie">Sortie</Option>
          </Select>
        </Form.Item>
  
        <Form.Item
          name="SousMontant"
          label={<Text strong style={{ fontSize: '16px' }}>Sous Montant</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
          style={{ fontSize: '16px', width: '100%', fontWeight: "bold", minHeight: '40px' }}
        >
          <InputNumber
            addonAfter={'DH'}
            placeholder="Sous montant"
            style={{ fontSize: '16px', fontWeight: 'bold',width:'100%'}}            disabled
          />
        </Form.Item>
  
        <Form.Item
          name="Reste"
          label={<Text strong style={{ fontSize: '16px' }}>Reste</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
          style={{ fontSize: '16px', width: '100%', fontWeight: "bold", minHeight: '40px' }}
        >
          <InputNumber
            disabled
            addonAfter={'DH'}
            placeholder="le montant"
            style={{ fontSize: '16px', fontWeight: 'bold',width:'100%'}}          />
        </Form.Item>
  
        <Form.Item
          name="Montant"
          label={<Text strong style={{ fontSize: '16px' }}>Total</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
          style={{ fontSize: '16px', width: '100%', fontWeight: "bold", minHeight: '40px' }}
        >
          <InputNumber
            disabled
            addonAfter={'DH'}
            placeholder="le montant"
            style={{ fontSize: '16px', fontWeight: 'bold',width:'100%'}}          />
        </Form.Item>
  
        <Form.Item>
          <Button style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px', marginRight: '10px' }} type="primary" htmlType="submit">
            Ajouter
          </Button>
          <Button style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px' }} onClick={handleCloseDrawer}>
            Annuler
          </Button>
        </Form.Item>
      </Form>
    );
  };
  // Edit Form Component for Modifier Utilisateur
  const EditUserForm = () => {
    const [form] = Form.useForm(); // Use Ant Design Form hook
  


    const [etudiantOptions, setEtudiantOptions] = useState([]);
    const [paiementOptions, setPaiementOptions] = useState([]);
    const [selectedEtudiant, setSelectedEtudiant] = useState(null);
    const [datapaiement, setDataPaiement] = useState(null);
    const [selectedPaiement, setSelectedPaiement] = useState(null);
  
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
  
    const fetchPaiement = async (etudiantId) => {
      try {
        const response = await axiosInstance.get(`/api/jointure/paiement-etudiant/${etudiantId}`);
        return response.data.map(paiement => ({
          id: paiement.ID_PaiementEtudiants,
          label: `${paiement.NomEtudiant} ${paiement.PrenomEtudiant} : EHPM-PAIE-${paiement.ID_PaiementEtudiants}`,
          Montant: paiement.Montant,
          Reste: paiement.Reste,
          MontantTotal: paiement.MontantTotal,
        }));
      } catch (error) {
        console.error('Error fetching paiement options:', error);
        return [];
      }
    };
  
    const updatePaiementOptions = async (etudiantId) => {
      if (etudiantId) {
        const paiement = await fetchPaiement(etudiantId);
        setPaiementOptions(paiement);
      } else {
        setPaiementOptions([]);
      }
    };
  
    useEffect(() => {
      updatePaiementOptions(selectedEtudiant);
    }, [selectedEtudiant]);
  
    const handleEtudiantChange = (value) => {
      setSelectedPaiement(value);
      const selectedPaiementDetails = paiementOptions.find(paiement => paiement.id === value);
      setDataPaiement(selectedPaiementDetails);
    };
  
   
  
    useEffect(() => {
      if (datapaiement) {
        form.setFieldsValue({
          SousMontant: datapaiement.Montant,
          Reste: datapaiement.Reste,
          MontantTotal: datapaiement.MontantTotal,
        });
      }
    }, [datapaiement, form]);
  



    // Function to get initial values excluding MotDePasse
    const getInitialValues = () => {
      const initialValues = { ...selectedRecord };
      initialValues.DateFacture = dayjs(initialValues.DateFacture);

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
            onChange={setSelectedEtudiant}
          >
            {etudiantOptions.map(etudiant => (
              <Option style={{ fontSize: '16px' }} key={etudiant.id} value={etudiant.id}>{etudiant.label}</Option>
            ))}
          </Select>
        </Form.Item>
  
        <Form.Item
          name='ID_PaiementEtudiants'
          label={<Text strong style={{ fontSize: '16px' }}>Paiement</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            style={{ fontSize: '16px' }}
            placeholder="Sélectionner un paiement"
            onChange={handleEtudiantChange}
            value={selectedPaiement}
            disabled={!selectedEtudiant}
          >
            {paiementOptions.map(paiement => (
              <Option style={{ fontSize: '16px' }} key={paiement.id} value={paiement.id}>{paiement.label}</Option>
            ))}
          </Select>
        </Form.Item>
  
        <Form.Item
          name="DateFacture"
          label={<Text strong style={{ fontSize: '16px' }}>Date Facture</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
          style={{ fontSize: '16px', width: '100%', fontWeight: "bold", minHeight: '40px' }}
          placeholder="Entrez la date de la facture"
        >
          <DatePicker style={{ fontSize: '16px', width: '100%' }} />
        </Form.Item>
  
        <Form.Item
          name="TypeFacture"
          label={<Text strong style={{ fontSize: '16px' }}>Type Facture</Text>}
          rules={[{ required: true, message: 'Veuillez sélectionner un groupe' }]}
          style={{ fontSize: '16px', width: '100%', fontWeight: "bold", minHeight: '40px' }}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            placeholder="Sélectionner un groupe"
          >
            <Option style={{ fontSize: '16px' }} value="Entree">Entrée</Option>
            <Option style={{ fontSize: '16px' }} value="Sortie">Sortie</Option>
          </Select>
        </Form.Item>
  
        <Form.Item
          name="SousMontant"
          label={<Text strong style={{ fontSize: '16px' }}>Sous Montant</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
          style={{ fontSize: '16px', width: '100%', fontWeight: "bold", minHeight: '40px' }}
        >
          <InputNumber
            addonAfter={'DH'}
            placeholder="Sous montant"
            style={{ fontSize: '16px', fontWeight: 'bold',width:'100%'}}            disabled
          />
        </Form.Item>
  
        <Form.Item
          name="Reste"
          label={<Text strong style={{ fontSize: '16px' }}>Reste</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
          style={{ fontSize: '16px', width: '100%', fontWeight: "bold", minHeight: '40px' }}
        >
          <InputNumber
            disabled
            addonAfter={'DH'}
            placeholder="le montant"
            style={{ fontSize: '16px', fontWeight: 'bold',width:'100%'}}          />
        </Form.Item>
  
        <Form.Item
          name="MontantTotal"
          label={<Text strong style={{ fontSize: '16px' }}>Total</Text>}
          rules={[{ required: true, message: 'Champ requis' }]}
          style={{ fontSize: '16px', width: '100%', fontWeight: "bold", minHeight: '40px' }}
        >
          <InputNumber
            disabled
            addonAfter={'DH'}
            placeholder="le montant"
            style={{ fontSize: '16px', fontWeight: 'bold',width:'100%'}}          />
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
          <Title level={3} style={{ fontSize: '24px' }}>Liste des factures</Title>
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
                  Ajouter une facture
                </Button>
              </Space>
            </Col>
          </Row>
          



          <Table columns={columns} dataSource={data} rowKey="ID_Facture" pagination={pagination} loading={refreshLoading}
            onChange={handleTableChange}  scroll={{ x: 'max-content' }} // This helps with horizontal scrolling if the table is too wide
            size="middle" // Optionally change the size of the table (default, middle, small)
            rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}   />


        </Space>
      </Card>

      <Drawer
  title={
    <Text strong style={{ fontSize: '22px' }}>
      {drawerType === 'add' ? 'Ajouter facture' : drawerType === 'edit' ? 'Modifier facture' : 'Afficher facture'}
    </Text>
  }
  width={drawerType === 'view' ? 900 : 800}
  onClose={handleCloseDrawer}
  visible={drawerVisible}
  bodyStyle={{ paddingBottom: 80 }}
>
  {drawerType === 'view' && selectedRecord && (
    <>
    <Descriptions column={1} bordered>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Nom etudiant</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.NomEtudiant}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Prenom etudiant</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.PrenomEtudiant}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Type Facture</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.TypeFacture}</Text>
      </Descriptions.Item>
     
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Date Facture</Text>}>
        <Text style={{ fontSize: '16px' }}>{moment(selectedRecord.DateFacture).format("DD/MM/YYYY")}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Montant</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.SousMontant} DH</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Reste</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.Reste} DH</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Total</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.MontantTotal} DH</Text>
      </Descriptions.Item>
    
     
   
    </Descriptions>
    


    <div style={{ marginTop: 20 }}>
             
    <Button type="primary" onClick={handlePrint}style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px',marginRight: '10px',marginLeft: 20 }} >Imprimer facture</Button>
  </div></>
  )}



  {drawerType === 'add' && <AddUserForm />}
  {drawerType === 'edit' && <EditUserForm />}
</Drawer>

    </div>

  );
};

export default CrudTable;
