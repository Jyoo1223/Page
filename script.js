// Sidebar navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    const target = this.getAttribute('href').replace('#', '');
    document.querySelectorAll('.main-section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(target).classList.remove('hidden');
    if (target === "books") renderBooks();
    if (target === "expenses") renderExpensesChart();
  });
});

// Skills modal content
const skillContent = {
  html: `
    <h2>HTML5</h2>
    <p><b>HTML5</b> structures web content with semantic elements.<br>
    Sample code:</p>
    <pre>
&lt;section&gt;
  &lt;h1&gt;Hello World&lt;/h1&gt;
  &lt;p&gt;This is HTML5 content.&lt;/p&gt;
&lt;/section&gt;
    </pre>
  `,
  css: `
    <h2>CSS3</h2>
    <p><b>CSS3</b> styles your pages with colors, layouts, and animations.<br>
    Sample code:</p>
    <pre>
body {
  background: linear-gradient(135deg,#e3f2fd,#e6fff7);
  color: #2c5f2d;
}
    </pre>
  `,
  js: `
    <h2>JavaScript</h2>
    <p><b>JavaScript</b> adds interactivity to websites.<br>
    Sample code:</p>
    <pre>
document.querySelector('button').onclick = () =&gt; {
  alert('Hello, JavaScript!');
};
    </pre>
  `,
  git: `
    <h2>Git</h2>
    <p><b>Git</b> tracks changes in your code.<br>
    Sample commands:</p>
    <pre>
git init
git add .
git commit -m "Initial commit"
    </pre>
  `,
  automation: `
    <h2>Automation</h2>
    <p><b>Automation</b> saves time by automating repetitive tasks.<br>
    Sample Python snippet:</p>
    <pre>
from selenium import webdriver
driver = webdriver.Chrome()
driver.get('https://example.com')
    </pre>
  `
};
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('click', function () {
    const skill = this.dataset.skill;
    if (!skill || !skillContent[skill]) return;
    document.getElementById('skill-modal-bg').classList.remove('hidden');
    document.getElementById('skill-modal').classList.remove('hidden');
    document.getElementById('modal-content').innerHTML = skillContent[skill];
  });
});
document.getElementById('close-modal').onclick = () => {
  document.getElementById('skill-modal-bg').classList.add('hidden');
  document.getElementById('skill-modal').classList.add('hidden');
};
document.getElementById('skill-modal-bg').onclick = () => {
  document.getElementById('skill-modal-bg').classList.add('hidden');
  document.getElementById('skill-modal').classList.add('hidden');
};

// Folder uploader and delete
const uploadedFilesList = document.getElementById('uploaded-files');
let uploadedFiles = JSON.parse(localStorage.getItem('jyothi_uploaded_files') || '[]');
function renderUploadedFiles() {
  uploadedFilesList.innerHTML = '';
  uploadedFiles.forEach((file, i) => {
    const li = document.createElement('li');
    li.textContent = file;
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'delete-file-btn';
    delBtn.onclick = () => {
      uploadedFiles.splice(i, 1);
      localStorage.setItem('jyothi_uploaded_files', JSON.stringify(uploadedFiles));
      renderUploadedFiles();
    };
    li.appendChild(delBtn);
    uploadedFilesList.appendChild(li);
  });
}
renderUploadedFiles();
document.getElementById('folder-input').addEventListener('change', function(e) {
  const filesArr = Array.from(this.files).map(f => f.webkitRelativePath || f.name);
  filesArr.forEach(f => {
    if (!uploadedFiles.includes(f)) uploadedFiles.push(f);
  });
  localStorage.setItem('jyothi_uploaded_files', JSON.stringify(uploadedFiles));
  renderUploadedFiles();
});

// To-Do List
let todos = JSON.parse(localStorage.getItem('jyothi_todos') || '[]');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
function renderTodos() {
  if (!todoList) return;
  todoList.innerHTML = '';
  todos.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task.text;
    if (task.done) li.classList.add('done');
    li.addEventListener('click', () => {
      todos[index].done = !todos[index].done;
      saveTodos();
      renderTodos();
    });
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'todo-delete-btn';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    });
    li.appendChild(delBtn);
    todoList.appendChild(li);
  });
}
function saveTodos() { localStorage.setItem('jyothi_todos', JSON.stringify(todos)); }
if (todoInput && document.getElementById('add-todo')) {
  document.getElementById('add-todo').onclick = () => {
    const val = todoInput.value.trim();
    if (val) {
      todos.push({ text: val, done: false });
      saveTodos();
      todoInput.value = '';
      renderTodos();
    }
  };
}
renderTodos();

// Expenses Table & Chart.js Graph
let expenses = JSON.parse(localStorage.getItem('jyothi_expenses') || '[]');
const expenseForm = document.getElementById('expense-form');
const expenseTableBody = document.querySelector('#expense-table tbody');
function renderExpenses() {
  expenseTableBody.innerHTML = '';
  expenses.forEach((exp, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${exp.desc}</td>
      <td>₹${parseFloat(exp.amount).toFixed(2)}</td>
      <td><button class="del-btn" onclick="deleteExpense(${i})">Delete</button></td>
    `;
    expenseTableBody.appendChild(row);
  });
  renderExpensesChart();
}
if (expenseForm) {
  expenseForm.onsubmit = function (e) {
    e.preventDefault();
    const desc = document.getElementById('expense-desc').value.trim();
    const amount = document.getElementById('expense-amount').value.trim();
    if (desc && amount && !isNaN(amount)) {
      expenses.push({ desc, amount: parseFloat(amount) });
      localStorage.setItem('jyothi_expenses', JSON.stringify(expenses));
      renderExpenses();
      this.reset();
    }
  };
}
window.deleteExpense = function(i) {
  expenses.splice(i, 1);
  localStorage.setItem('jyothi_expenses', JSON.stringify(expenses));
  renderExpenses();
};
let expensesChart = null;
function renderExpensesChart() {
  const ctx = document.getElementById('expensesChart').getContext('2d');
  const grouped = {};
  expenses.forEach(exp => {
    grouped[exp.desc] = (grouped[exp.desc] || 0) + parseFloat(exp.amount);
  });
  const labels = Object.keys(grouped);
  const data = Object.values(grouped);
  if (expensesChart) expensesChart.destroy();
  expensesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Expenses',
        data: data,
        backgroundColor: [
          '#64b5f6', '#81c784', '#ffd54f', '#ff8a65', '#ba68c8',
          '#4fc3f7', '#ffb74d', '#aed581', '#f06292', '#9575cd'
        ]
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Expenses by Category' }
      },
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}
renderExpenses();

// Bookshelf
let books = JSON.parse(localStorage.getItem('jyothi_books') || '[]');
const bookForm = document.getElementById('book-form');
const bookshelfGrid = document.getElementById('bookshelf-grid');
function renderBooks() {
  bookshelfGrid.innerHTML = '';
  books.forEach((book, i) => {
    const card = document.createElement('div');
    card.className = 'book-card';
    if (book.img) {
      const img = document.createElement('img');
      img.src = book.img;
      img.alt = book.title;
      img.className = 'book-img';
      card.appendChild(img);
    }
    const title = document.createElement('div');
    title.className = 'book-title';
    title.textContent = book.title;
    card.appendChild(title);
    const author = document.createElement('div');
    author.className = 'book-author';
    author.textContent = book.author;
    card.appendChild(author);
    const delBtn = document.createElement('button');
    delBtn.className = 'book-delete-btn';
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => { books.splice(i, 1); saveBooks(); renderBooks(); };
    card.appendChild(delBtn);
    bookshelfGrid.appendChild(card);
  });
}
function saveBooks() { localStorage.setItem('jyothi_books', JSON.stringify(books)); }
if (bookForm) {
  bookForm.onsubmit = function(e) {
    e.preventDefault();
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const img = document.getElementById('book-img').value.trim();
    if (title && author) {
      books.push({ title, author, img });
      saveBooks();
      renderBooks();
      this.reset();
    }
  };
}
renderBooks();

// Notes (localStorage)
const notesArea = document.getElementById('personal-notes');
const notesStatus = document.getElementById('notes-status');
if (notesArea) notesArea.value = localStorage.getItem('jyothi_notes') || '';
if (document.getElementById('save-notes')) {
  document.getElementById('save-notes').onclick = () => {
    localStorage.setItem('jyothi_notes', notesArea.value);
    notesStatus.textContent = 'Notes saved!';
    setTimeout(() => (notesStatus.textContent = ''), 1500);
  };
}
