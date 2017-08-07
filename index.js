"use strict";

var MyForm = {
    /**
     * Компоненты страницы
     * @private
     */
    _components: {
        fio: document.querySelector('input[name=fio]'),
        email: document.querySelector('input[name=email]'),
        phone: document.querySelector('input[name=phone]'),
        resultContainer: document.getElementById('resultContainer'),
        submitButton: document.getElementById('submitButton')
    },

    /**
     * Объект регулярных выражений
     * @private
     */
    _rules: {
        fio: /^\s*([A-zА-яЁё]+\s+){2}[A-zА-яЁё-]+\s*$/i,
        email: /^[A-Z0-9А-ЯёЁ.]+@ya(ndex)?\.(ru|ua|by|kz|com)$/i,
        phone: /^\+7\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}$/i
    },

    /**
     * Удаляет класс error у всех форм перед валидацией
     * @private
     */
    _clearErrorClass: function () {
        var inputAll = document.querySelectorAll('input');

        Object.keys(inputAll).forEach(function(inputKey) {
            inputAll[inputKey].classList.remove('error');
        });
    },

    /**
     * Добавляет класс error всем полям, не прошедшим валидацию
     * @param {Object} result
     * @private
     */
    _addErrorClass: function (result) {
        result.errorFields.forEach(function (inputName) {
            var errorInput = document.querySelector('input[name=' + inputName + ']');
            errorInput.classList.add('error');
        });
    },

    /**
     * Возвращает сумму всех цифр номера телефона
     * @param {String} phone Телефонный номер
     * @returns {Number}
     * @private
     */
    _getAmountPhoneNumbers: function(phone) {
        var phoneNumbersArr = phone.match(/[0-9]/g);

        if(!phoneNumbersArr) {
            return;
        }

        return phoneNumbersArr.reduce(function(sum, current) {
            return +sum + +current;
        });
    },

    /**
     * Возвращает название файла ответа
     * @returns {String}
     * @private
     */
    _getRandomResponse: function() {
        var responses = ['error.json', 'progress.json', 'success.json'];
        var randomKey = Math.floor(Math.random() * 3);
        return responses[randomKey];
    },

    /**
     * Отправка данных аяксом
     * @private
     */
    _sendAjax: function () {
        var xhr = new XMLHttpRequest();
        var _that = this;

        xhr.onload = function() {
            if(this.status === 200) {
                var json = JSON.parse(this.responseText);

                switch(json.status) {
                    case 'success':
                        _that._components.resultContainer.className = 'success';
                        _that._components.resultContainer.textContent = 'Success';
                        break;
                    case 'error':
                        _that._components.resultContainer.className = 'error';
                        _that._components.resultContainer.textContent = json.reason;
                        break;
                    case 'progress':
                        _that._components.resultContainer.className = 'progress';
                        setTimeout(function(){
                            xhr.open('GET', 'responses/' + _that._getRandomResponse());
                            xhr.send();
                        }, json.timeout);
                        break;
                }
            }
        };

        xhr.open('GET', document.getElementById('myForm').getAttribute('action'));
        xhr.send();
    },

    /**
     * Валидация формы, возвращает объект с результатом валидации и массивом названий полей не прошедших валидацию
     * @returns {Object}
     * @public
     */
    validate: function() {
        var inputValid = {
            fio: this._rules.fio.test(this._components.fio.value),
            email: this._rules.email.test(this._components.email.value),
            phone: this._rules.phone.test(this._components.phone.value) && this._getAmountPhoneNumbers(this._components.phone.value) <= 30
        };

        return {
            isValid: Object.keys(inputValid).every(function(item){
                return inputValid[item];
            }),
            errorFields: Object.keys(inputValid).filter(function(item){
                return !inputValid[item];
            })
        };
    },

    /**
     * Получает объект значений формы
     * @returns {Object}
     * @public
     */
    getData: function() {
        return {
            fio: this._components.fio.value,
            email: this._components.email.value,
            phone: this._components.phone.value
        }
    },

    /**
     * Устанавливает значения переданного объекта значениям формы
     * @param {Object} object
     * @public
     */
    setData: function(object) {
        if (object.fio) this._components.fio.value = object.fio;
        if (object.email) this._components.email.value = object.email;
        if (object.phone) this._components.phone.value = object.phone;
    },

    /**
     * Метод, выполняющийся при сабмите формы
     * @public
     */
    submit: function() {

        this._clearErrorClass();
        var result = this.validate();

        if(!result.isValid) {
            this._addErrorClass(result);
        } else {
            this._components.submitButton.disabled = true;
            this._sendAjax();
        }
    }
};

(function() {
    document.getElementById('submitButton').addEventListener('click', function(e) {
        e.preventDefault();
        MyForm.submit();
    });
})();
