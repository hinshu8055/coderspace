#include <bits/stdc++.h>
using namespace std;

// ================= Bank Account =================
class BankAccount {
    double balance;

public:
    BankAccount(double bal) : balance(bal) {}

    bool withdraw(double amount) {
        if (amount > balance) return false;
        balance -= amount;
        return true;
    }

    void deposit(double amount) {
        balance += amount;
    }

    double getBalance() {
        return balance;
    }
};

// ================= Card =================
class Card {
    string cardNumber;
    int pin;
    BankAccount* account;

public:
    Card(string num, int pin, BankAccount* acc)
        : cardNumber(num), pin(pin), account(acc) {}

    bool validatePIN(int enteredPin) {
        return pin == enteredPin;
    }

    BankAccount* getAccount() {
        return account;
    }
};

// ================= ATM State Pattern =================

// State Interface
class ATMState {
public:
    virtual void insertCard() = 0;
};

// Forward declaration
class ATM;

// Idle State
class IdleState : public ATMState {
public:
    void insertCard() override {
        cout << "Card inserted\n";
    }
};

// ================= ATM =================
// Singleton Pattern used here
class ATM {
    ATMState* state;
    static ATM* instance;

    ATM() {
        state = new IdleState();
    }

public:
    static ATM* getInstance() {
        if (!instance)
            instance = new ATM();
        return instance;
    }

    void setState(ATMState* s) {
        state = s;
    }

    void insertCard() {
        state->insertCard();
    }
};

ATM* ATM::instance = nullptr;

// ================= Demo =================
int main() {

    BankAccount acc(1000);
    Card card("1234", 1111, &acc);

    ATM* atm = ATM::getInstance();

    atm->insertCard();

    if (card.validatePIN(1111)) {
        cout << "PIN correct\n";
        acc.withdraw(200);
        cout << "Remaining Balance: " << acc.getBalance() << endl;
    }

    return 0;
}