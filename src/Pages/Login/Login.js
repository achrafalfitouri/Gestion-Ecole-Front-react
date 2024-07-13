import React, { useContext, useState } from 'react';
import { Form, Input, Button, message, Row, Col, Card, Checkbox, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axiosInstance from '../../Middleware/axiosInstance';
import { Navigate } from "react-router-dom";

const { Item } = Form;
const { Title, Text } = Typography;

const Login = () => {
  const [navigate, setNavigate] = useState(false);
  
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', values);
      localStorage.setItem('token', response.data.token);
      message.success('Connexion réussie!');

      const userResponse = await axiosInstance.get('/api/auth/me');
      localStorage.setItem('user', JSON.stringify(userResponse.data)); // Store as JSON string

      setNavigate(true); // Redirect to home or dashboard
    } catch (error) {
      message.error('Échec de la connexion. Veuillez vérifier vos identifiants.');
    }
  };

  if (navigate) {
    return <Navigate to="/" />;
  }

  return (
    <Row justify="center" align="middle" style={{ height: '100vh', backgroundColor: '#fff' }}>
    <Col xs={24} md={12} style={{ textAlign: 'center', padding: '50px', backgroundColor: '#ffffff' }}>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'Helvetica, Arial, Futura' }}>
          EHPM
        </div>
      </div><br /><br />
      <Title level={2} style={{ fontSize: '24px', fontWeight: 'bold',color:'#636261' }}>Gérez votre école avec :</Title><br />
      <ul style={{ textAlign: 'left', fontSize: '18px', lineHeight: '1.5', fontWeight: 'bold', listStyle: 'none' ,color:'#636261'}}>
        <li>
        <Text strong style={{ display: 'inline-block', marginRight: '10px' }}>✔</Text> 

          Outil tout-en-un<br />
          Simplifiez la gestion de la scolarité et des finances de votre établissement.
</li><br />
        <li>
        <Text strong style={{ display: 'inline-block', marginRight: '10px' }}>✔</Text> 

        Centralisez la gestion de vos étudiants, des enseignants, des paiements, et bien plus.
</li>
      </ul>
    </Col>
      <Col xs={24} md={12} style={{ padding: '50px' }}>
        <Card   title={<strong style={{ fontSize: '35px' }}>Se connecter</strong>} style={{ width: '70%' }}><br /><br />
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Item
              name="Email"
              label={<Text strong style={{ fontSize: '16px' }}>Email</Text>}
              rules={[
                {
                  required: true,
                  message: 'Veuillez saisir votre email!',
                },
              ]}
              
            >
              <Input strong               style={{ fontSize: '16px', width: '100%', minHeight: '50px' ,borderRadius:"20px"}}   prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email" />
            </Item>
            <br />
            <Item
              name="MotDePasse"
              label={<Text strong style={{ fontSize: '16px' }}>Mot de passe</Text>}
              rules={[
                {
                  required: true,
                  message: 'Veuillez saisir votre mot de passe!',
                },
              ]}
            >
              <Input.Password
              strong
              style={{ fontSize: '16px', width: '100%', minHeight: '50px' ,borderRadius:"20px"}} 
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Mot de passe"
              />
            </Item>


            <br />
            <Item>
              <Button type="primary" htmlType="submit" style={{ fontSize: '20px', width: '100%', minHeight: '45px',fontWeight:"bold",borderRadius:"15px" }}               >
                Se connecter
              </Button>
             
            </Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;
