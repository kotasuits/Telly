let currentUser = null;

// Load data
function loadData() {
  let users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.length === 0) {
    users = [{ id: 1, name: "Admin", email: "admin@tally.com", password: "123456", role: "admin" }];
    localStorage.setItem('users', JSON.stringify(users));
  }
  let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
  return { users, invoices };
}

// Login
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { users } = loadData();

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'dashboard.html';
  } else {
    alert("Invalid credentials! Use admin@tally.com / 123456");
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

// Check login
function checkLogin() {
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser && window.location.pathname.includes('dashboard')) {
    window.location.href = 'login.html';
  }
  if (currentUser && document.getElementById('username')) {
    document.getElementById('username').textContent = currentUser.name;
  }
}

// Create Invoice
function createInvoice() {
  const customer = document.getElementById('customer').value;
  const amount = parseFloat(document.getElementById('amount').value);
  if (!customer || !amount) return alert("Fill all fields");

  let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
  invoices.push({
    id: Date.now(),
    userId: currentUser.id,
    invoiceNo: "INV-" + Date.now(),
    customerName: customer,
    date: new Date().toISOString().split('T')[0],
    amount: amount,
    status: "Pending"
  });
  localStorage.setItem('invoices', JSON.stringify(invoices));
  alert("Invoice Created!");
  loadInvoices();
}

// Load Invoices
function loadInvoices() {
  const div = document.getElementById('invoiceList');
  if (!div) return;
  let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
  let html = '<table border="1" width="100%"><tr><th>Date</th><th>Invoice</th><th>Customer</th><th>Amount</th><th>Status</th></tr>';
  invoices.forEach(inv => {
    html += `<tr><td>${inv.date}</td><td>${inv.invoiceNo}</td><td>${inv.customerName}</td><td>₹${inv.amount}</td><td>${inv.status}</td></tr>`;
  });
  html += '</table>';
  div.innerHTML = html;
}

// Add User
function addUser() {
  const name = document.getElementById('newName').value;
  const email = document.getElementById('newEmail').value;
  const pass = document.getElementById('newPass').value;
  if (!name || !email || !pass) return alert("All fields required");

  let users = JSON.parse(localStorage.getItem('users')) || [];
  users.push({ id: Date.now(), name, email, password: pass, role: "user" });
  localStorage.setItem('users', JSON.stringify(users));
  alert("User Added!");
  loadUsers();
}

function loadUsers() {
  const div = document.getElementById('userList');
  if (!div) return;
  let users = JSON.parse(localStorage.getItem('users')) || [];
  div.innerHTML = users.map(u => `<p>${u.name} (${u.email})</p>`).join('');
}

// Excel Export
function exportAllToExcel() {
  let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
  let csv = "Date,Invoice No,Customer,Amount,Status\n";
  invoices.forEach(i => {
    csv += `${i.date},${i.invoiceNo},${i.customerName},${i.amount},${i.status}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Tally_Ledger.csv';
  link.click();
  alert("Downloaded as CSV (Open in Excel)");
}

// Initialize
window.onload = () => {
  checkLogin();
  loadInvoices();
  loadUsers();
};
