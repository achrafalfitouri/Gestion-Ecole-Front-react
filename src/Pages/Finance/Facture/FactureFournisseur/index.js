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
    const NomFournisseur = selectedRecord.NomFournisseur;
    const AdresseFournisseur = selectedRecord.Adresse;
    const TelFournisseur = selectedRecord.Tel;
    const EmailFournisseur = selectedRecord.Email;
    const TypeFacture = selectedRecord.TypeFacture;
    const AdresseEHPM = '123 EHPM St, City, Country'; // Replace with actual address

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Fournisseur:', 10, 54);
    doc.setFont('helvetica', 'normal');
    doc.text(NomFournisseur, 40, 54);

    doc.setFont('helvetica', 'bold');
    doc.text('Adresse:', 10, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(AdresseFournisseur, 40, 62);

    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 10, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(EmailFournisseur, 40, 70);

    doc.setFont('helvetica', 'bold');
    doc.text('Tel:', 10, 78);
    doc.setFont('helvetica', 'normal');
    doc.text(TelFournisseur, 40, 78);

    doc.setFont('helvetica', 'bold');
    doc.text('Facture:', 10, 86);
    doc.setFont('helvetica', 'normal');
    doc.text(TypeFacture, 40, 86);

    // Invoice details on the right
    const dateFacture = dayjs(selectedRecord.DateFacture).format('DD/MM/YYYY');
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 150, 20);
    doc.setFont('helvetica', 'normal');
    doc.text(`Facture N°: ${selectedRecord.ID_Facture}`, 150, 30);
    doc.text(`Date: ${dateFacture}`, 150, 38);
    doc.text(`Commande N°: ${selectedRecord.ID_DetailFacture}`, 150, 46);

    // Table Headers
    const tableColumn = ['QTE', 'DÉSIGNATION', 'PRIX UNIT. HT', 'MONTANT HT'];

    // Table Data
    const articlesArray = selectedRecord.Articles.split('\n');
    const quantitiesArray = selectedRecord.Quantites.split('\n');
    const pricesArray = selectedRecord.PrixUnitaires.split('\n');

    const tableRows = articlesArray.map((article, index) => {
        const quantity = quantitiesArray[index].trim();
        const price = pricesArray[index].trim();

        if (article.trim() && quantity && price) {
            const montant = (quantity * price).toFixed(2);
            return [quantity, article, price, montant];
        }
    }).filter(row => row !== undefined); // Filter out any undefined rows

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
            0: { cellWidth: 20 },
            1: { cellWidth: 70 },
            2: { cellWidth: 40 },
            3: { cellWidth: 40 }
        }
    });

    // Calculate totals
    const totalMontant = parseFloat(selectedRecord.SousMontant).toFixed(2);
    const taxes = (parseFloat(selectedRecord.SousMontant) * parseFloat(selectedRecord.Valeur) / 100).toFixed(2);
    const finalMontant = parseFloat(selectedRecord.Montant).toFixed(2);

    // Draw totals section
    const startY = doc.autoTable.previous.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);

    doc.text('Total HT:', 116, startY);
    doc.text(`${totalMontant} DH`, 158, startY);
    
    doc.text(`TVA ${selectedRecord.Valeur}%:`, 116, startY + 10);
    doc.text(`${taxes} DH`, 158, startY + 10);
    
    doc.text('TOTAL:', 116, startY + 20);
    doc.text(`${finalMontant} DH`, 158, startY + 20);

    // Draw borders for totals section
    doc.rect(104, startY - 5, 80, 30); // Adjust the position and size as needed

  

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
    




    
 // Center the title

    // Footer with Date and Address
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const bottomY = pageHeight - 20; // Adjust the bottom margin
    doc.setFont('helvetica', 'normal');
    doc.text(`Adresse EHPM: ${AdresseEHPM}`, 10, bottomY - 10);
    doc.text(`Date Facture: ${dateFacture}`, 10, bottomY);

    // Save PDF
    doc.save('facture.pdf');
};


  const fetchData = async () => {
    setRefreshLoading(true);
    try {
        const response = await axiosInstance.get('/api/factures', {
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

      title: <Text strong style={{ fontSize: '16px' }}>Nom fournisseur</Text>,
      dataIndex: 'NomFournisseur',
      key: 'NomFournisseur',
      sorter: (a, b) => a.NomFournisseur.localeCompare(b.NomFournisseur),
      ...getColumnSearchProps('NomFournisseur'),
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
        title: <Text strong style={{ fontSize: '16px' }}>Montant HT</Text>,
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
        title: <Text strong style={{ fontSize: '16px' }}>TVA</Text>,
        dataIndex: 'Valeur',
        key: 'Valeur',
        sorter: (a, b) => (a.Valeur || '').localeCompare(b.Valeur || ''),
        ...getColumnSearchProps('Valeur'),
        render: (text) => (
          <Text strong style={{ fontSize: '16px' }}>
            {(text || 0)}%
          </Text>
        ),
        ellipsis: true,
      },


    {
        title: <Text strong style={{ fontSize: '16px' }}>Total</Text>,
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
        const factureResponse = await axiosInstance.post('/api/factures', values);
        const factureId = factureResponse.data.ID_Facture;
  console.log("data",factureId)

  
        // Poster chaque article dans detailsfacture
        const articles = values.articles || [];
        for (const article of articles) {
          const detailsValues = {
            ID_Facture: factureId,
            Article: article.Article,
            Description: article.Description,
            Quantite: article.Quantite,
            PrixUnitaire: article.PrixUnitaire,
          };
          await axiosInstance.post('/api/detailsfacture', detailsValues);
        }
  
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
 
  const [fournisseurOptions, setFournisseurOptions] = useState([]);
  useEffect(() => {
    const fetchFournisseurOptions = async () => {
      try {
        const response = await axiosInstance.get('/api/fournisseurs');
        setFournisseurOptions(response.data);
      } catch (error) {
        console.error('Error fetching classes options:', error);
        message.error('Erreur lors du chargement des options de filiere');
      }
    };

    fetchFournisseurOptions();
  }, []);
  

  const [taxeOptions, setTaxeOptions] = useState([]);
  useEffect(() => {
    const fetchTaxeOptions = async () => {
      try {
        const response = await axiosInstance.get('/api/taxe');
        setTaxeOptions(response.data);
      } catch (error) {
        console.error('Error fetching classes options:', error);
        message.error('Erreur lors du chargement des options de filiere');
      }
    };

    fetchTaxeOptions();
  }, []);
  


  const AddUserForm = () => {
    const [form] = Form.useForm();


    const [selectedTax, setSelectedTax] = useState(null);
    const [taxAmount, setTaxAmount] = useState(0);
  
    const calculateSumOfTotals = (articles) => {
      const sum = articles.reduce((acc, article) => {
        const total = article.total || 0;
        return acc + total;
      }, 0);
      form.setFieldsValue({
        SousMontant: sum,
      });
      return sum;
    };
  
    const handleTaxChange = (value) => {
      setSelectedTax(value);
      const sum = form.getFieldValue('SousMontant') || 0;
      const taxRate = taxeOptions.find(tax => tax.ID_Taxe === value)?.Valeur || 0;
      const tax = sum * taxRate/100;
      setTaxAmount(tax);
      form.setFieldsValue({
        Montant: sum + tax,
        TaxeMontant : tax
      });
    };
  
    const calculateTotal = (index) => {
      const articles = form.getFieldValue('articles') || [];
      const updatedArticles = articles.map((article, i) => {
        if (i === index) {
          const quantite = article.Quantite || 0;
          const prix = article.PrixUnitaire || 0;
          const total = quantite * prix;
          return {
            ...article,
            total: total,
          };
        }
        return article;
      });
  
      form.setFieldsValue({
        articles: updatedArticles,
      });
  
      const sum = calculateSumOfTotals(updatedArticles);
      const taxRate = taxeOptions.find(tax => tax.ID_Taxe === selectedTax)?.Valeur  || 0;
      const tax = sum * taxRate/100;
      setTaxAmount(tax);
      form.setFieldsValue({
        Montant: sum + tax,
        TaxeMontant : tax
      });
    };
  
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        autoComplete="off"
      >
       
  
            
                <Form.Item
                  name="ID_Fournisseur"
                  label={<Text strong style={{ fontSize: '16px' }}>Nom fournisseur</Text>}
                  rules={[{ required: true, message: 'Veuillez sélectionner une filière' }]}
                  style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}                >
                  <Select
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {fournisseurOptions.map((fournisseur) => (
                      <Option
                        key={fournisseur.ID_Fournisseur}
                        value={fournisseur.ID_Fournisseur}
                        style={{ fontSize: '16px' }}
                      >
                        {fournisseur.NomFournisseur}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
  
                <Form.Item
                  name="DateFacture"
                  label={<Text strong style={{ fontSize: '16px' }}>Date Facture</Text>}
                  rules={[{ required: true, message: 'Champ requis' }]}
                  style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}                   placeholder="Entrez la date de la facture"
                >
                  <DatePicker style={{ fontSize: '16px', width: '100%' }}       />
                </Form.Item>
  
                <Form.Item
                  name="TypeFacture"
                  label={<Text strong style={{ fontSize: '16px' }}>Type Facture</Text>}
                  rules={[{ required: true, message: 'Veuillez sélectionner un groupe' }]}
                  style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}                >
                  <Select
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                   
                    placeholder="Sélectionner un groupe"
                  >
                    <Option style={{ fontSize: '16px' }}  value="Entree">Entrée</Option>
                    <Option style={{ fontSize: '16px' }} value="Sortie">Sortie</Option>
                  </Select>
                </Form.Item>
  
                <Form.List name="articles" initialValue={[]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                        <Row key={key} gutter={20} align="middle">
                          <Col  span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'Article']}
                              fieldKey={[fieldKey, 'Article']}
                              label={<Text strong style={{ fontSize: '16px' }}>Article</Text>}
                              rules={[{ required: true, message: 'Champ requis' }]}
                              style={{ fontSize: '16px', width: '100%',fontWeight:"bold" }}
                            >
                              <Input                   style={{ fontSize: '16px', width: '100%' }}
 placeholder="Article" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'Description']}
                              fieldKey={[fieldKey, 'Description']}
                              label={<Text strong style={{ fontSize: '16px' }}>Description</Text>}
                              rules={[{ required: true, message: 'Champ requis' }]}
                              style={{ fontSize: '16px',fontWeight:"bold" }}
                            >
                              <Input     style={{ fontSize: '16px', width: '100%' }}

  placeholder="Description" />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'Quantite']}
                              fieldKey={[fieldKey, 'Quantite']}
                              label={<Text strong style={{ fontSize: '16px' }}>Quantité</Text>}
                              rules={[{ required: true, message: 'Champ requis' }]}
                              style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold"}}                            >
                              <InputNumber                       style={{ fontSize: '16px', width: '100%' }}
 placeholder="Quantité" />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'PrixUnitaire']}
                              fieldKey={[fieldKey, 'PrixUnitaire']}
                              label={<Text strong style={{ fontSize: '16px' }}>Prix</Text>}
                              rules={[{ required: true, message: 'Champ requis' }]}
                              style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}                    disabled
                              >
                              <InputNumber                     style={{ fontSize: '16px', width: '100%' }}
 addonAfter={'DH'} placeholder="Prix" />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'total']}
                              fieldKey={[fieldKey, 'total']}
                              label={<Text strong style={{ fontSize: '16px' }}>Total</Text>}
                              rules={[{ required: true, message: 'Champ requis' }]}
                              style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}      disabled
                              >
                              <InputNumber                    style={{ fontSize: '16px', width: '100%' }}
 addonAfter={'DH'} placeholder="Total" disabled />
                            </Form.Item>
                          </Col>
                          <Col span={1}>
                            <PlusCircleOutlined onClick={() => calculateTotal(index)} style={{ fontSize: '20px', fontWeight: 'bold' }} />
                          </Col>
                          <Col span={1}>
                            <DeleteOutlined onClick={() => remove(name)} style={{ fontSize: '20px', fontWeight: 'bold' }} />
                          </Col>
                        </Row>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          Ajouter un champ
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
  
                <Form.Item
                  name="SousMontant"
                  label={<Text strong style={{ fontSize: '16px' }}>Sous Montant</Text>}
                  rules={[{ required: true, message: 'Champ requis' }]}
                  style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}
                >
                  <InputNumber
addonAfter={'DH'}                    placeholder="Sous montant"
style={{ fontSize: '16px', width: '100%' }}
disabled
                  />
                </Form.Item>
              
                <Row gutter={20} align="middle">
                    <Col span={12}>
                <Form.Item
 name="ID_Taxe"                  label={<Text strong style={{ fontSize: '16px' }}>Taxe</Text>}
                  style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}
                >
                  <Select
                    style={{ fontSize: '16px'}}
                    placeholder="Sélectionner une taxe"
                    onChange={handleTaxChange}
                  >
                    {taxeOptions.map((taxe) => (
                      <Option
                        key={taxe.ID_Taxe}
                        value={taxe.ID_Taxe}
                        style={{ fontSize: '16px' }}
                      >
                        {taxe.Nom}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                </Col>
                <Col span={12}>
                <Form.Item
                 style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}
                  name="TaxeMontant"
                  label={<Text strong style={{ fontSize: '16px' }}>Taxe Montant</Text>}
                  rules={[{ required: true, message: 'Champ requis' }]}
                >
                  <InputNumber
addonAfter={'DH'}                    placeholder="Taxe Montant"
style={{ fontSize: '16px', width: '100%'}}
disabled
                  />
                </Form.Item>
                </Col>
                </Row>
                <Form.Item
                  name="Montant"
                  label={<Text strong style={{ fontSize: '16px' }}>Montant</Text>}
                  rules={[{ required: true, message: 'Champ requis' }]}
                  style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}
                >
                  <InputNumber
                  disabled
                  addonAfter={'DH'}                    placeholder="le montant"
                  style={{ fontSize: '16px', width: '100%'}}
/>
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
  


    const [selectedTax, setSelectedTax] = useState(null);
    const [taxAmount, setTaxAmount] = useState(0);
  
  
    const calculateSumOfTotals = (articles) => {
      const sum = articles.reduce((acc, article) => {
        const total = article.total || 0;
        return acc + total;
      }, 0);
      form.setFieldsValue({
        SousMontant: sum,
      });
      return sum;
    };
  
    const handleTaxChange = (value) => {
      setSelectedTax(value);
      const sum = form.getFieldValue('SousMontant') || 0;
      const taxRate = taxeOptions.find(tax => tax.ID_Taxe === value)?.Valeur || 0;
      const tax = sum * taxRate/100;
      setTaxAmount(tax);
      form.setFieldsValue({
        Montant: sum + tax,
        TaxeMontant : tax
      });
    };
  
    const calculateTotal = (index) => {
      const articles = form.getFieldValue('articles') || [];
      const updatedArticles = articles.map((article, i) => {
        if (i === index) {
          const quantite = article.Quantite || 0;
          const prix = article.PrixUnitaire || 0;
          const total = quantite * prix;
          return {
            ...article,
            total: total,
          };
        }
        return article;
      });
  
      form.setFieldsValue({
        articles: updatedArticles,
      });
  
      const sum = calculateSumOfTotals(updatedArticles);
      const taxRate = taxeOptions.find(tax => tax.ID_Taxe === selectedTax)?.Valeur  || 0;
      const tax = sum * taxRate/100;
      setTaxAmount(tax);
      form.setFieldsValue({
        Montant: sum + tax,
        TaxeMontant : tax
      });
    };
  




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
                  name="ID_Fournisseur"
                  label={<Text strong style={{ fontSize: '16px' }}>Nom fournisseur</Text>}
                  style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}                >
                  <Select
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {fournisseurOptions.map((fournisseur) => (
                      <Option
                        key={fournisseur.ID_Fournisseur}
                        value={fournisseur.ID_Fournisseur}
                        style={{ fontSize: '16px' }}
                      >
                        {fournisseur.NomFournisseur}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
  
                <Form.Item
                  name="DateFacture"
                  label={<Text strong style={{ fontSize: '16px' }}>Date Facture</Text>}
                  style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}                   placeholder="Entrez la date de la facture"
                >
                  <DatePicker style={{ fontSize: '16px', width: '100%' }}       />
                </Form.Item>
  
                <Form.Item
                  name="TypeFacture"
                  label={<Text strong style={{ fontSize: '16px' }}>Type Facture</Text>}
                  style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}                >
                  <Select
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                   
                    placeholder="Sélectionner un groupe"
                  >
                    <Option style={{ fontSize: '16px' }}  value="Entree">Entrée</Option>
                    <Option style={{ fontSize: '16px' }} value="Sortie">Sortie</Option>
                  </Select>
                </Form.Item>
  
                <Form.List name="articles" initialValue={[]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                        <Row key={key} gutter={20} align="middle">
                          <Col  span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'Article']}
                              fieldKey={[fieldKey, 'Article']}
                              label={<Text strong style={{ fontSize: '16px' }}>Article</Text>}
                              rules={[{ required: true, message: 'Champ requis' }]}
                              style={{ fontSize: '16px', width: '100%',fontWeight:"bold" }}
                            >
                              <Input                   style={{ fontSize: '16px', width: '100%' }}
 placeholder="Article" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'Description']}
                              fieldKey={[fieldKey, 'Description']}
                              label={<Text strong style={{ fontSize: '16px' }}>Description</Text>}
                              rules={[{ required: true, message: 'Champ requis' }]}
                              style={{ fontSize: '16px',fontWeight:"bold" }}
                            >
                              <Input     style={{ fontSize: '16px', width: '100%' }}

  placeholder="Description" />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'Quantite']}
                              fieldKey={[fieldKey, 'Quantite']}
                              label={<Text strong style={{ fontSize: '16px' }}>Quantité</Text>}
                              rules={[{ required: true, message: 'Champ requis' }]}
                              style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold"}}                            >
                              <InputNumber                       style={{ fontSize: '16px', width: '100%' }}
 placeholder="Quantité" />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'PrixUnitaire']}
                              fieldKey={[fieldKey, 'PrixUnitaire']}
                              label={<Text strong style={{ fontSize: '16px' }}>Prix</Text>}
                              style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}                    disabled
                              >
                              <InputNumber                     style={{ fontSize: '16px', width: '100%' }}
 addonAfter={'DH'} placeholder="Prix" />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'total']}
                              fieldKey={[fieldKey, 'total']}
                              label={<Text strong style={{ fontSize: '16px' }}>Total</Text>}
                              style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}      disabled
                              >
                              <InputNumber                    style={{ fontSize: '16px', width: '100%' }}
 addonAfter={'DH'} placeholder="Total" disabled />
                            </Form.Item>
                          </Col>
                          <Col span={1}>
                            <PlusCircleOutlined onClick={() => calculateTotal(index)} style={{ fontSize: '20px', fontWeight: 'bold' }} />
                          </Col>
                          <Col span={1}>
                            <DeleteOutlined onClick={() => remove(name)} style={{ fontSize: '20px', fontWeight: 'bold' }} />
                          </Col>
                        </Row>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          Ajouter un champ
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
  
                <Form.Item
                  name="SousMontant"
                  label={<Text strong style={{ fontSize: '16px' }}>Sous Montant</Text>}
                  style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}
                >
                  <InputNumber
addonAfter={'DH'}                    placeholder="Sous montant"
style={{ fontSize: '16px', width: '100%' }}
disabled
                  />
                </Form.Item>
              
                <Row gutter={20} align="middle">
                    <Col span={12}>
                <Form.Item
 name="ID_Taxe"                  label={<Text strong style={{ fontSize: '16px' }}>Taxe</Text>}
                  style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}
                >
                  <Select
                    style={{ fontSize: '16px'}}
                    placeholder="Sélectionner une taxe"
                    onChange={handleTaxChange}
                  >
                    {taxeOptions.map((taxe) => (
                      <Option
                        key={taxe.ID_Taxe}
                        value={taxe.ID_Taxe}
                        style={{ fontSize: '16px' }}
                      >
                        {taxe.Nom}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                </Col>
                <Col span={12}>
                <Form.Item
                 style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}
                  name="TaxeMontant"
                  label={<Text strong style={{ fontSize: '16px' }}>Taxe Montant</Text>}
                >
                  <InputNumber
addonAfter={'DH'}                    placeholder="Taxe Montant"
style={{ fontSize: '16px', width: '100%'}}
disabled
                  />
                </Form.Item>
                </Col>
                </Row>
                <Form.Item
                  name="Montant"
                  label={<Text strong style={{ fontSize: '16px' }}>Montant</Text>}
                  style={{ fontSize: '16px', width: '100%' ,fontWeight:"bold",minHeight:'40px'}}
                >
                  <InputNumber
                  disabled
                  addonAfter={'DH'}                    placeholder="le montant"
                  style={{ fontSize: '16px', width: '100%'}}
/>
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
    <Descriptions column={1} bordered>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Nom fournisseur</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.NomFournisseur}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Type Facture</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.TypeFacture}</Text>
      </Descriptions.Item>
     
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Date Facture</Text>}>
        <Text style={{ fontSize: '16px' }}>{moment(selectedRecord.DateFacture).format("DD/MM/YYYY")}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Montant HT</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.SousMontant}</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>TVA</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.Valeur}%</Text>
      </Descriptions.Item>
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Total</Text>}>
        <Text style={{ fontSize: '16px' }}>{selectedRecord.Montant}</Text>
      </Descriptions.Item>
     
      <Descriptions.Item label={<Text strong style={{ fontSize: '16px' }}>Details facture</Text>}>
        <Button
          icon={<EyeOutlined />}
          onClick={() => {
            // Open a drawer to show students
            setDrawerType('listEtudiants');
            setDrawerVisible(true);
          }}
          style={{ fontWeight: 'bold', fontSize: '14px' }}
        >
          Voir Details facture
        </Button>
      </Descriptions.Item>
    </Descriptions>
  )}

{drawerType === 'listEtudiants' && (
      <Drawer
      
        title={<Text strong style={{ fontSize: '22px' }}>Details facture</Text>}
        width={980}
        onClose={handleCloseDrawer}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <div>
          {selectedRecord && (
            <>
              <Descriptions
  bordered
  column={4}
  layout="vertical"
  style={{ width: '100%', border: '1px solid #f0f0f0' }}
>
  <Descriptions.Item
    label={<Text strong style={{ fontSize: '16px' }}>Article</Text>}
    contentStyle={{ fontSize: '16px' }}
  >
    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
      {selectedRecord.Articles ? selectedRecord.Articles.split('\n').map((article, index) => (
        <div key={index} style={{ borderBottom: '1px solid #ddd', padding: '5px 0' }}>
          {article}
        </div>
      )) : 'No articles available'}
    </pre>
  </Descriptions.Item>

  <Descriptions.Item
    label={<Text strong style={{ fontSize: '16px' }}>Description</Text>}
    contentStyle={{ fontSize: '16px' }}
  >
    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
      {selectedRecord.Descriptions ? selectedRecord.Descriptions.split('\n').map((description, index) => (
        <div key={index} style={{ borderBottom: '1px solid #ddd', padding: '5px 0' }}>
          {description}
        </div>
      )) : 'No descriptions available'}
    </pre>
  </Descriptions.Item>

  <Descriptions.Item
    label={<Text strong style={{ fontSize: '16px' }}>Quantite</Text>}
    contentStyle={{ fontSize: '16px' }}
  >
    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
      {selectedRecord.Quantites ? selectedRecord.Quantites.split('\n').map((quantite, index) => (
        <div key={index} style={{ borderBottom: '1px solid #ddd', padding: '5px 0' }}>
          {quantite}
        </div>
      )) : 'No quantities available'}
    </pre>
  </Descriptions.Item>

  <Descriptions.Item
    label={<Text strong style={{ fontSize: '16px' }}>PrixUnitaire</Text>}
    contentStyle={{ fontSize: '16px' }}
  >
    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
      {selectedRecord.PrixUnitaires ? selectedRecord.PrixUnitaires.split('\n').map((prixUnitaire, index) => (
        <div key={index} style={{ borderBottom: '1px solid #ddd', padding: '5px 0' }}>
          {prixUnitaire}
        </div>
      )) : 'No unit prices available'}
    </pre>
  </Descriptions.Item>
</Descriptions>

              <div style={{ marginTop: 20 }}>
             
                <Button type="primary" onClick={handlePrint}style={{ fontSize: '16px', fontWeight: 'bold', borderRadius: '10px',marginRight: '10px',marginLeft: 20 }} >Imprimer facture</Button>
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
