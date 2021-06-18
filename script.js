const Modal = {
  // método
  open() {
    // Abrir modal
    // Adicionar a class active ao modal
    let openModal = document.querySelector(".modal-overlay");
    openModal.classList.add("active");
  },
  close() {
    // fechar o modal
    // remover a class active do modal
    let closeModal = document.querySelector(".modal-overlay");
    closeModal.classList.remove("active");
  },
};

// Salvar no local Storage
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions" , JSON.stringify(transactions));
    }
};

// para conter minhas transações

// objeto para transações
const Transaction = {
  // para todas as transações
  all: Storage.get(),
  // métodos
  // Adicionar uma transação
  add(transaction) {
    Transaction.all.push(transaction);
    
    App.reaload();
  },
  // Remover uma transação
  remove(index) {
    Transaction.all.splice(index, 1);

    App.reaload();
  },

  incomes() {
    let income = 0;
    // pegar todas as transações
    Transaction.all.forEach((transaction) => {
      // para cada transação, se ela for maior que zero
      // se for maior que zero e retornar a variavel
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });

    return income;
  },

  expenses() {
    // Somar as saídas

    let expense = 0;
    // pegar todas as transações
    Transaction.all.forEach((transaction) => {
      // para cada transação, se ela for menor que zero
      // se for maior que zero e retornar a variavel
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense;
  },

  total() {
    // entradas - saídas
    return Transaction.incomes() + Transaction.expenses();
  },
};

// Substituir os dados do HTML com os dados do js

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  // adicionar transação e o index dela(posição)
  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    // para receber um html
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },
  // substituição
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
            </td>
        `;

    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );

    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );

    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatAmount(value) {
    value = Number(value.replace(/\,\./g, "")) * 100;

    return value;
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    // Expreção regular
    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
};
// formulario
const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validadeFields() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  formtValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();
    // verificar se todas as informações foram preenchidas
    try {
      //   Form.validadeFields();
      // formatar os dados para salvar
      const transaction = Form.formtValues();
      // salvar
      Form.saveTransaction(transaction);
      // apagar os dados do formulario
      Form.clearFields();
      // modal feche
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    // for para coleção de objetos da transação
    Transaction.all.forEach((transaction, index) => {

      DOM.addTransaction(transaction, index);

      Storage.set(Transaction.all);
    });

    DOM.updateBalance();
  },
  reaload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();