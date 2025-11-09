import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useNavigate, Link } from 'react-router-dom';

const REGISTER_BORROWER = gql`
  mutation RegisterBorrower($firstName: String!, $surname: String!, $phoneNumber: String!, $whatsappNumber: String) {
    registerBorrower(firstName: $firstName, surname: $surname, phoneNumber: $phoneNumber, whatsappNumber: $whatsappNumber) {
      id
      csrfToken
    }
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [registerBorrower, { loading }] = useMutation(REGISTER_BORROWER, {
    onCompleted: ({ registerBorrower }) => {
      window.localStorage.setItem('borrowerAuth', JSON.stringify({ id: registerBorrower.id, csrfToken: registerBorrower.csrfToken }));
      navigate('/borrower');
    }
  });

  const ADMIN_LOGIN = gql`
    mutation AdminLogin($email: String!, $password: String!) {
      adminLogin(email: $email, password: $password) { apiKey }
    }
  `;

  const [adminLogin, { loading: adminLoading, error: adminError }] = useMutation(ADMIN_LOGIN, {
    onCompleted: ({ adminLogin }) => {
      try {
        window.localStorage.setItem('adminApiKey', adminLogin.apiKey);
        window.localStorage.removeItem('forceBorrowerMode');
        window.localStorage.removeItem('borrowerAuth');
      } catch (_) {}
      navigate('/admin');
    }
  });

  const loginAdminViaRest = async () => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      window.localStorage.setItem('adminApiKey', data.apiKey);
      window.localStorage.removeItem('forceBorrowerMode');
      window.localStorage.removeItem('borrowerAuth');
      navigate('/admin');
    } catch (e) {
      console.error('Admin REST login failed', e);
      alert('Admin login failed. Please check credentials and server.');
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Borrower Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
          <Input placeholder="Surname" value={surname} onChange={e => setSurname(e.target.value)} />
          <Input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
          <Input placeholder="WhatsApp number (optional)" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
          <Button disabled={loading || !firstName || !surname || !phone} onClick={() => registerBorrower({ variables: { firstName, surname, phoneNumber: phone, whatsappNumber: whatsapp || null } })}>
            {loading ? 'Registering…' : 'Continue'}
          </Button>
          <div className="text-xs text-muted-foreground">Already registered? If you previously registered in this browser, you’ll be redirected automatically.</div>
          <div className="text-sm">
            <Link to="/admin" className="underline">Admin page</Link>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
          <div className="flex gap-2">
            <Button disabled={adminLoading || !adminEmail || !adminPassword} onClick={() => adminLogin({ variables: { email: adminEmail, password: adminPassword } })}>
              {adminLoading ? 'Logging in…' : 'Login'}
            </Button>
          </div>
          {adminError && (
            <div className="text-xs text-destructive-foreground">{adminError.message}</div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}