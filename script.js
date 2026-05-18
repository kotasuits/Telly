let currentUser = null;
let currentItems = [];

// Load/Save Data
function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Check Login
function checkLogin() {
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) window.location.href = 'login.html';
}

// Add Item in Voucher
function addItem() {
  const itemName = document.getElementById('itemName').value;
  const qty = parseFloat(document.getElementById('qty').value) || 1;
  const rate = parseFloat(document.getElementById('rate').value) || 0;
  const amount = qty * rate;

  if (!itemName || rate <= 0) return alert("Enter valid item details");

  currentItems.push({ itemName, qty, rate, amount });
  renderItems();
  
  // Clear fields
  document.getElementById('itemName').value = '';
  document.getElementById('rate').value = '';
}

function renderItems() {
  const div = document.getElementById('itemList');
  let html = '<table border="1" width="100%"><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>';
  let total = 0;
  currentItems.forEach((item, i) => {
    html += `<tr><td>${item.itemName}</td><td>${item.qty}</td><td>${item.rate}</td><td>₹${item.amount}</td></tr>`;
    total += item.amount;
  });
  html += `<tr><td colspan="3"><b>Total</b></td><td><b>₹${total}</b></td></tr></table>`;
  div.innerHTML = html;
}

// Save Voucher (Main Tally-like function)
function saveVoucher() {
  const type = document.getElementById('voucherType').value;
  const party = document.getElementById('partyName').value;
  const date = document.getElementById('voucherDate').value || new Date().toISOString().split('T')[0];

  if (!party) return alert("Enter Party Name");

  let vouchers = getData('vouchers');
  const total = currentItems.reduce((sum, item) => sum + item.amount, 0);

  vouchers.push({
    id: Date.now(),
    userId: currentUser.id,
    voucherType: type,
    voucherNo: type.substring(0,3).toUpperCase() + "-" + Date.now().toString().slice(-6),
    partyName: party,
    date: date,
    items: [...currentItems],
    total: total,
    gst: (total * 0.18).toFixed(2)  // 18% GST example
  });

  saveData('vouchers', vouchers);
  alert("Voucher Saved Successfully! (Like Tally)");
  
  currentItems = [];
  renderItems();
  document.getElementById('partyName').value = '';
}

// Export to Excel (Real Ledger Style)
function exportToExcel() {
  let vouchers = getData('vouchers');
  let csv = "Date,Voucher Type,Voucher No,Party,Total,GST\n";
  
  vouchers.forEach(v => {
    csv += `${v.date},${v.voucherType},${v.voucherNo},${v.partyName},${v.total},${v.gst}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Tally_Ledger_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}

// Parties Management
function addParty() {
  const name = document.getElementById('partyNameNew').value;
  const type = document.getElementById('partyType').value;
  if (!name) return alert("Enter Party Name");

  let parties = getData('parties');
  parties.push({ id: Date.now(), name, type });
  saveData('parties', parties);
  loadParties();
  alert("Party Added");
}

function loadParties() {
  const div = document.getElementById('partyList');
  if (!div) return;
  let parties = getData('parties');
  div.innerHTML = parties.map(p => `<p>${p.name} (${p.type})</p>`).join('');
}

// Initialize on load
window.onload = () => {
  checkLogin();
  if (document.getElementById('voucherDate')) {
    document.getElementById('voucherDate').value = new Date().toISOString().split('T')[0];
  }
  loadParties();
  renderItems();
};
