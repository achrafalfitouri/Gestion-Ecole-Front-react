import React, { Suspense, useEffect, useState } from 'react';
import { BankOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BookOutlined, CalendarOutlined, DashboardOutlined, FileTextOutlined, IdcardOutlined, LineChartOutlined, SnippetsOutlined, UploadOutlined, UserAddOutlined, UserOutlined, VideoCameraOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { Layout, Menu, theme, Dropdown, Button, Row, Col, Space, Avatar, Popconfirm, Spin, Typography } from 'antd';
import './style.css';
import AppRoutes from '../Routes';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { Navigate } from "react-router-dom";

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

const Components = () => {
  const [logoText, setLogoText] = useState("EHPM");
  const [collapsed, setCollapsed] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // State to track hover state

  const [isLoading, setIsLoading] = useState(true);


  const navigate = useNavigate(); // Initialize useNavigate hook


  // const handleMenuClick = (item) => {
  //   setIsLoading(true); // Set loading state to true when menu item is clicked
  //   setTimeout(() => {
  //     navigate(item.key); // Navigate after a short delay to simulate loading
  //     setIsLoading(false); // Set loading state to false after navigating
  //   }, 500); // Adjust delay time as needed
  // };


  useEffect(() => {
    // Simulate async operation
    setTimeout(() => {
      setIsLoading(false); // Set loading state to false after 2 seconds (simulating data fetch)
    }, 1000);
  }, []); // Run only once on component mount

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTimeout(() => {
      setIsLoading(true); // Set loading state to false after 1000ms (or after redirection)
    }, 1000);
  
    setTimeout(() => {
      setIsLoading(false); // Set loading state to false after 1000ms (or after redirection)
      navigate('/login'); // Redirect to login page after 1000ms
    }, 1000);
  };
  
  
const userLogin = JSON.parse(localStorage.getItem('user'));
const user = localStorage.getItem('user');
const token = localStorage.getItem('token');

if (!user || !token) {
  return <Navigate to="/login" />;
}
  //logout button
  
  const hoverStyles = {
    fontSize: '18px',
    color: '#ce5254',
  };


  const itemsDropdown = [
    {
      label: <Text strong style={{ fontSize: '16px' }}>Gérer Compte</Text>,
      key: '1',
      onClick: () => navigate('/manage-account'), // Example navigation with navigate
    },
    {
      label: <Text strong style={{ fontSize: '16px' }}>Déconnexion</Text>,
      key: '2',
      danger: true,
      onClick: handleLogout,
    },
  ];
  
  const settingsDropdownItems = [
    {
      label: <Text strong style={{ fontSize: '16px' }}>Créer Année Scolaire</Text>,
      key: '1',
      onClick: () => navigate('/anneescolaire'), // Navigate to the appropriate route
    },
    {
      key: '2',
      onClick: () => navigate('/salle'), // Navigate to the appropriate route
    },
    {
      label: <Text strong style={{ fontSize: '16px' }}>Créer Type de Paiement</Text>,

      key: '3',
      onClick: () => navigate('/typepaiement'), // Navigate to the appropriate route

    },
    {
      label: <Text strong style={{ fontSize: '16px' }}>Créer Mode de Paiement</Text>,

      key: '4',
      onClick: () => navigate('/modepaiement'), // Navigate to the appropriate route

    },

    {
      label: <Text strong style={{ fontSize: '16px' }}>Calendrier</Text>,
      key: '5',
      onClick: () => navigate('/calendrier'), // Navigate to the appropriate route
    },
  ];

  const menuProps = {
    items: itemsDropdown,
  };

  const settingsMenuProps = {
    items: settingsDropdownItems,
  };


  const items = [
    {
      label: "Tableau de bord",
      icon: <DashboardOutlined />,
      key: "/",

    },
    {
      label: "Utilisateur",
      key: "/utilisateur",
      icon: <UserOutlined />,

    },
    {
      label: "Rendez-vous",
      key: "/rendezvous",
      icon: <CalendarOutlined />,
    },
    {
      label: "Scolarite",
      key: "/scolarite",
      icon: <BankOutlined />,
      children: [
        {
          key: 'etudiant',
          label: 'Etudiant',
        },
        {
          key: 'inscription',
          label: 'Inscription',
        },
        {
          key: 'formateur',
          label: 'Formateur',
        },
        {
          key: 'filiere',
          label: 'Filière',
        },
        { 
          key: 'classe',
          label: 'Classe & Niveau',
          children: [
            {
             
                key: 'classe',
                label: 'Classe',
            
            },
            {
             
                key: 'niveau',
                label: 'Niveau',
            
            },
          
          
          
          ] },
       
        {
          key: 'matiere',
          label: 'Matière',
        },
        {
          key: 'absence',
          label: 'Absence',
        },
       
        {
          key: 'stage',
          label: 'Suivi de stage',
        },
        {
          key: 'planing',
          label: 'Emploie de temps',
        },
      ],
    },
    {
      label: "Finance",
      key: "/finance",
      icon: <LineChartOutlined />,
      children: [
        {
          key: '11',
          label: 'Facture',
        },
        {
          key: 'fournisseur',
          label: 'Fournisseur',
        },
        {
          key: '13',
          label: 'Paiement',
          children: [
        
            {
              key: '132',
              label: 'Paiement Personnel',
            },
            {
              key: 'paiementetudiant',
              label: 'Paiement Etudiant',
            },
           
          ]
        },
        {
          key: 'personnel',
          label: 'Personnel',
        },
      ],
    }
  ];

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    isLoading ? (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    ) : (
      <Layout>
        <Sider
          width={230}
          breakpoint="lg"
          collapsedWidth="0"
          onBreakpoint={(broken) => {
            console.log(broken);
          }}
          onCollapse={(collapsed, type) => {
            console.log(collapsed, type);
          }}
        >
          <div className="demo-logo-vertical" />
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              color: "white",
              fontSize: '20px',
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: "bold",
            }}
          >
            {logoText}
          </div>
          <Menu
            onClick={(item) => {
              navigate(item.key);
            }}
            style={{
              fontSize: '16px',
              fontWeight: "bold",
            }}
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['4']}
            items={items}
          />
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', textAlign: "center" }}>
            <LogoutOutlined
              style={{
                color: 'white',
                fontSize: '16px',
                transition: 'font-size 0.3s, color 0.3s',
                margin: '8px',
                marginRight: '-4px',
                textAlign: "center",
                ...(isHovered && hoverStyles), // Apply hover styles when button is hovered
              }}
            />
            <Popconfirm
              title="Are you sure you want to logout?"
              onConfirm={handleLogout}
              okText="Yes"
              cancelText="No"
              visible={confirmLogout}
              onCancel={() => setConfirmLogout(false)}
            >
              <Button
                type="text"
                onClick={() => setConfirmLogout(true)}
                style={{
                  color: 'white',
                  fontSize: '16px',
                  transition: 'font-size 0.3s, color 0.3s',
                  ...(isHovered && hoverStyles), // Apply hover styles when button is hovered
                }}
                onMouseEnter={() => setIsHovered(true)} // Set isHovered to true on mouse enter
                onMouseLeave={() => setIsHovered(false)} // Set isHovered to false on mouse leave
              >
                <span style={{ visibility: collapsed ? 'hidden' : 'visible' }}>Deconnexion</span>
              </Button>
            </Popconfirm>
          </div>
        </Sider>
        <Layout>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <div style={{ marginRight: '30px', display: 'flex', alignItems: 'center' }}>
              <Space wrap>
              <Dropdown
              
                  overlay={<Menu items={settingsDropdownItems} />}
                  placement="bottomRight"
                  arrow
                >
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SettingOutlined />}
                    style={{
                      marginLeft: '10px',
                      backgroundColor: '#001529', // Dark navy background
                      borderColor: '#001529',
                    }}
                  />
                </Dropdown>
                <span
                  style={{
                    padding: '10px 12px',
                    background: '#001529', // Dark navy background
                    borderRadius: '25px', // Rounded corners
                    color: '#ffffff', // White text
                    fontWeight: 'bold',
                    fontFamily: 'Montserrat, sans-serif', // Professional bold font
                    fontSize: '16px', // Adjust font size as needed
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Shadow for depth
                  }}
                >
                  {userLogin ? `${userLogin.PrenomUtilisateur} ${userLogin.NomUtilisateur}` : 'Guest'}
                </span>
                
                <Dropdown
                  style={{
                    fontSize: '16px',
                    fontWeight: "bold",
                  }}
                  overlay={<Menu items={itemsDropdown} />}
                  placement="bottomRight"
                  arrow
                >
                  <Avatar
                    style={{
                      backgroundColor: '#87d068',
                      cursor: 'pointer',
                      fontSize: '20px',
                      width: '40px', // Increase avatar width
                      height: '40px', // Increase avatar height
                    }}
                    icon={<UserOutlined />}
                  />
                </Dropdown>
               
              </Space>
            </div>
          </Header>
          <Content
            style={{
              margin: '24px 16px 0',
            }}
          >
            <div
              style={{
                padding: 24,
                minHeight: "100vh",
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
            
                <AppRoutes />
            
            </div>
          </Content>
          <Footer
            style={{
              textAlign: 'center',
            }}
          >
            Ant Design ©{new Date().getFullYear()} Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    )
  );
  
};

export default Components;
