// Đối tượng Validator 

function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            //Phương thức .mathches kiểm tra xem element.parentElement có match với 
            //selector hay không ?
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    //Hàm thực hiện validate(Xác nhận)
    function validate(inputElement, rule) {
        var errorMessage = rule.test(inputElement.value);
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');

        //Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];
        //Lặp qua từng rule & kiểm tra
        //Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);

            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }
        return !errorMessage;
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);


    if (formElement) {

        //Khi submit form 
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;
            //Lặp qua từng rule và validate
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                //Trường hợp submit bằng javascript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) return values;
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;

                        }
                        return values;
                        // gán input.value cho values[input.name] 
                        // cuối cùng return về values 
                    }, {});
                    options.onSubmit(formValues);
                }
                //Trường hợp submit bằng hành vi mặc định 
                else {
                    formElement.submit();
                }
            }
        }

        //Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input,...)
        options.rules.forEach((rule) => {
            //Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);
            //Vi phuong thuc querySelectorAll tra ve Nodelist nen 
            //dung phuog thuc Array.from() de convert sang Array
            Array.from(inputElements).forEach(function(inputElement) {
                //Xử lý trường hợp blur khỏi input
                inputElement.onblur = function() {
                        validate(inputElement, rule)
                    }
                    //Xử lý mỗi khi người dùng nhập vào Input
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            });

        });
        // console.log(selectorRules);

    }
}


// Định nghĩa rules
Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message || 'Vui lòng nhập lại trường này' //trim() là hàm xóa khoảng trắng ở đầu và cuối chuỗi(Không xóa khoảng trắng ở giữa chuỗi)
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; //Biểu thức chính quy
            return regex.test(value) ? undefined : message || 'Trường này phải là Email';
        }
    }
}

Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}