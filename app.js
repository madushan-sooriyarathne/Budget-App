class Storage {

    constructor() {
        this._storage = window.localStorage;
    }

    _getItems(itemName) {
        return JSON.parse(this._storage.getItem(itemName));
    }

    _saveItems(itemList, name) {
        this._storage.setItem(name, JSON.stringify(itemList));
        
    }

    addItem(item) {
        // item is a object {'id': <str>, type': <str> 'exp' or 'inc', 'description': <str>, 'amount': <float>}

        let itemStack;
        if(item.type == 'exp') {
            itemStack = this._getItems('expenses');
            if(itemStack == null) {
                this._saveItems([], 'expenses');
                itemStack = [];
            }
            itemStack.push(item);
            this._saveItems(itemStack, 'expenses');
        } else {
            itemStack = this._getItems('income');
            if(itemStack == null) {
                this._saveItems([], 'expenses');
                itemStack = [];
            }
            itemStack.push(item);
            this._saveItems(itemStack, 'income');
        }
    }

    removeItem(itemId) {

        let itemStack;
        if(itemId.startsWith('expense')) {
            itemStack = this._getItems('expenses');
            itemStack.forEach((item, index) => {
                if(item.id == itemId) {
                    itemStack.splice(index, 1);
                    return;
                }
            });

            this._saveItems(itemStack, 'expenses')

        }else {
            itemStack = this._getItems('income');
            itemStack.forEach((item, index) => {
                if(item.id == itemId) {
                    itemStack.splice(index, 1);
                    return;
                }
            });
            this._saveItems(itemStack, 'income');
        }
    } 

    getExpenses() {
        return JSON.parse(this._storage.getItem('expenses'));
    }

    getIncomes() {
        return JSON.parse(this._storage.getItem('income'));
    }


}

class UIController {

    constructor() {
        this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',  'November', 'December'];

        this.expCounter = -1;
        this.incCounter = -1;

        //form fields
        this.typeSelector = document.querySelector('.add__type');
        this.descriptionFiled = document.querySelector('.add__description');
        this.amountFiled = document.querySelector('.add__value');

        // record lists
        this.expenseList = document.querySelector('.expenses__list');
        this.incomeList = document.querySelector('.income__list');

        // Summery / Upper section
        this.total = document.querySelector('.budget__value');
        this.income = document.querySelector('.budget__income--value');
        this.expenses = document.querySelector('.budget__expenses--value');
        this.expensesPresentage = document.querySelector('.budget__expenses--percentage');


        
    }
    
    // Get data from fields
    getData() {
        //Returns a object {'type': <str>'exp' or 'inc', 'description':<str>, 'amount': <float>}
        return {
            'type': this.typeSelector.value,
            'description': this.descriptionFiled.value,
            'amount': parseFloat(this.amountFiled.value)
        }
    }

    setMonth() {
        let date = new Date();
        document.querySelector('.budget__title--month').textContent = `${this.months[date.getMonth()]} ${date.getFullYear()}`;
    }

    addExpense(exp) {
        //exp is a object {'id': <str>, description': <str>, 'amount': <float>, 'presentage': <float>}
        let expenseRow = document.createElement('div');
        expenseRow.classList = 'item clearfix';
        expenseRow.setAttribute('id', `${exp.id}`);
        expenseRow.innerHTML = `
        <div class="item__description">${exp.description}</div>
        <div class="right clearfix">
            <div class="item__value">- ${exp.amount}</div>
            <div class="item__percentage">${exp.presentage}%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
        </div>`

        this.expenseList.appendChild(expenseRow);
        this.expCounter++;
    } 

    addIncome(inc) {
        //inc is a object {'id': <str>, 'description': <str>, 'amount': <float>}
        let incomeRow = document.createElement('div');
        incomeRow.classList = 'item clearfix';
        incomeRow.setAttribute('id', `${inc.id}`);
        incomeRow.innerHTML = `
        <div class="item__description">${inc.description}</div>
        <div class="right clearfix">
            <div class="item__value">+ ${inc.amount}</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
        </div>`

        this.incomeList.appendChild(incomeRow);
        this.incCounter++;
    }

    updateSummery(sumObj) {
        //sumObj: {'total': <float>, 'totalIncome': <float>, 'totalExpense': <float>}
        this.total.textContent = `${sumObj.total < 0 ? '' : '+'}${parseFloat(sumObj.total).toFixed(2)}`;
        this.income.textContent = `+ ${parseFloat(sumObj.totalIncome).toFixed(2)}`;
        this.expenses.textContent = `- ${parseFloat(sumObj.totalExpense).toFixed(2)}`;
        this.expensesPresentage.textContent = `${parseFloat(sumObj.totalExpense/sumObj.totalIncome * 100).toFixed(1)} %`;
    } 

    clearFields() {
        this.descriptionFiled.value = '';
        this.amountFiled.value = '';
    }

    clearDocument() {
        this.clearFields();
        this.expenseList.innerHTML = '';
        this.incomeList.innerHTML = '';

        this.total.textContent = '00.00';
        this.income.textContent = '+ 00.00';
        this.expenses.textContent = '- 00.00';
        this.expensesPresentage.textContent = '0 %';
    }

    deleteElement(el) {
       el.remove();
    }

    changeTypeColor() {
   
        document.querySelector('.add__type').classList.toggle('red-focus');
        document.querySelector('.add__description').classList.toggle('red-focus');
        document.querySelector('.add__value').classList.toggle('red-focus');
        document.querySelector('.add__btn').classList.toggle('red');
    }


}

class BudgetController {
    constructor() {
        this._incomeList = [];
        this._expenseList = [];
        this._total = 0.0;
        this._totalExpense = 0.0;
        this._totalIncome = 0.0;
    }

    addItem(item) {
        //item is a object {'id': <str>, type': <str> 'exp' or 'inc', 'description': <str>, 'amount': <float>}
        if(item.type == 'exp') {
            this._expenseList.push(item);
            this._total -= item.amount;
            this._totalExpense += item.amount;

        } else if(item.type == 'inc'){
            this._incomeList.push(item);
            this._total += item.amount;
            this._totalIncome += item.amount;
        }
     }

     deleteEntry(el) {
         if(el.id.startsWith('income')) {
            // Income Delete
            this._totalIncome = 0.0;
            this._incomeList.forEach((item, index) => {
                if(item.id == el.id) {
                    this._incomeList.splice(index, 1);
                    return;
                }
                this._totalIncome += item.amount;
            });

            this._total = this._totalIncome - this._totalExpense;
         }
         else {
            this._totalExpense = 0.0;
            this._expenseList.forEach((item, index) => {
                if(item.id == el.id) {
                    this._expenseList.splice(index, 1);
                    return;
                }
                this._totalExpense += item.amount;
            });
            this._total = this._totalIncome - this._totalExpense;
         }
     }

     get totalIncome() {
         return this._totalIncome;
     }

     get incomeList() {
         return this._incomeList;
     }

     get expenseList() {
         return this._expenseList;
     }

     get totalExpense() {
         return this._totalExpense;
     }

     get total() {
         return this._total;
     }
}

const Controller = ((budgetController, uiController, strg) => {

    let expCount = 0;
    let incCount = 0;

    document.addEventListener('DOMContentLoaded', (event) => {
        //Clear Document
        uiController.clearDocument();

        //Load data from local Storage if any entries exists.
        let incomes = strg.getIncomes();
        let expenses = strg.getExpenses();

        if(incomes != null || expenses != null) {
            //Add Incomes
            incomes.forEach((item, index) => {
                //Add Item to budget controller
                budgetController.addItem(item);

                //Add Item to UI
                uiController.addIncome({'id': item.id, 'description': item.description, 'amount': parseFloat(item.amount).toFixed(2)});

                //Update UI summery
                uiController.updateSummery({'total': budgetController.total, 'totalIncome': budgetController.totalIncome, 'totalExpense': budgetController.totalExpense});
            });

            //Add expenses
            expenses.forEach((item, index) => {
                //Add Item to budget controller
                budgetController.addItem(item);

                //Add Item to UI
                uiController.addExpense({'id': item.id, 'description': item.description, 'amount': parseFloat(item.amount).toFixed(2), 'presentage': parseFloat(item.amount / budgetController.totalIncome * 100).toFixed(1) })

                //Update UI summery
                uiController.updateSummery({'total': budgetController.total, 'totalIncome': budgetController.totalIncome, 'totalExpense': budgetController.totalExpense});

            });
        }

        //Set the month
        uiController.setMonth()

        // add the type select event
        document.querySelector('.add__type').addEventListener('change', uiController.changeTypeColor);
    });

    const addItem = () => {
        //Get data from UIController
        let data = uiController.getData();

        //Validate Data
        if(data.description == '' || data.amount == '') {
            alert('Please fill both description and amount fields');
            return null;
        }

        //Add Item to budget Controller
        budgetController.addItem({'id': data.type == 'exp'? `expense-${expCount}`: `income-${incCount}`, ...data});

        //Add Item to Local Storage
        strg.addItem({'id': data.type == 'exp'? `expense-${expCount}`: `income-${incCount}`, ...data});

        //Update Expense / Income rows in UI
        if(data.type == 'exp') {
            uiController.addExpense({'id': `expense-${expCount++}`, 'description': data.description, 'amount': parseFloat(data.amount).toFixed(2), 'presentage': parseFloat(data.amount / budgetController.totalIncome * 100).toFixed(1)});
        } else {
            uiController.addIncome({'id': `income-${incCount++}`, 'description': data.description, 'amount': parseFloat(data.amount).toFixed(2)});
        }

        //Update the ui With updated data
        uiController.updateSummery({'total': budgetController.total, 'totalIncome': budgetController.totalIncome, 'totalExpense': budgetController.totalExpense});


        //Clear Input Fields
        uiController.clearFields();
    };

    // Button Click and Return Key Pressed Events
    document.querySelector('.add__btn').addEventListener('click', (event) => addItem());
    document.addEventListener('keypress', (event) => {
        //Check for the return key keycode
        if (event.keyCode === 13) {
            addItem();
        }
    });

    //Delete Button click Event
    document.querySelector('#lists').addEventListener('click', (event) => {
        if (event.target.classList.contains('item__delete--btn')) {

            // Get the origin item
            let clickTarget = event.target.parentElement.parentElement.parentElement.parentElement; 

            //Delete the coresponding row from UI
            uiController.deleteElement(clickTarget);

            //Delete Item from Budget Controller
            budgetController.deleteEntry(clickTarget);

            //Delete Item from LocalStorage
            strg.removeItem(clickTarget.id);

            //Update the summery in UI
            uiController.updateSummery({'total': budgetController.total, 'totalIncome': budgetController.totalIncome, 'totalExpense': budgetController.totalExpense});
        }
        
    });

})(new BudgetController(), new UIController(), new Storage());