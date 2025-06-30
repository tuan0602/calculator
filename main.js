document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttonsGrid = document.querySelector('.buttons-grid');

    let currentInput = '0'; 
    let calculationString = '';
    let lastButtonIsOperator = false;
    let hasResult = false;

    // Cập nhật hiển thị màn hình
    function updateDisplay() {
        if (hasResult) {
            display.textContent = currentInput; // Nếu đã có kết quả, chỉ hiển thị kết quả
        } else if (calculationString === '' && currentInput === '0') {
            // Khởi tạo ban đầu hoặc sau khi xóa hết
            display.textContent = '0'; 
        } else {
            // Hiển thị chuỗi phép tính + số hiện tại
            display.textContent = calculationString + currentInput;
        }
    }

    // Xử lý khi nhấn nút số
    function inputDigit(digit) {
        if (hasResult) { 
            // Nếu đang hiển thị kết quả, bắt đầu phép tính mới
            currentInput = digit;
            calculationString = '';
            hasResult = false;
        } else if (currentInput === '0' || lastButtonIsOperator) {
            currentInput = digit;
            lastButtonIsOperator = false;
        } else {
            currentInput += digit;
        }
        updateDisplay();
    }

    // Xử lý khi nhấn nút dấu chấm
    function inputDecimal(dot) {
        if (hasResult) { // Nếu đang hiển thị kết quả, bắt đầu phép tính mới
            currentInput = '0.';
            calculationString = '';
            hasResult = false;
        } else if (lastButtonIsOperator) {
            currentInput = '0.';
            lastButtonIsOperator = false;
        } else if (!currentInput.includes(dot)) {
            currentInput += dot;
        }
        updateDisplay();
    }

    // Xử lý phép toán
    function handleOperator(nextOperator) {
        hasResult = false; // Bất kỳ thao tác toán tử nào cũng reset trạng thái kết quả

        if (lastButtonIsOperator) {
            // Nếu nút cuối cùng là toán tử, thay thế toán tử cũ bằng toán tử mới
            calculationString = calculationString.slice(0, -1) + nextOperator; // Loại bỏ toán tử cuối cùng và thêm cái mới
        } else {
            // Thêm số hiện tại và toán tử vào chuỗi tính toán
            calculationString += currentInput + nextOperator;
            currentInput = '0'; // Đặt lại currentInput để nhập số tiếp theo
        }
        lastButtonIsOperator = true;
        updateDisplay();
    }

    // Hàm thực hiện tính toán chuỗi biểu thức
    function evaluateExpression(expression) {
        expression = expression.replace(/x/g, '*').replace(/÷/g, '/');
        try {
            let result = eval(expression);

            if (Number.isInteger(result)) {
                return result.toString();
            } else {
                return parseFloat(result.toFixed(10)).toString();
            }
        } catch (e) {
            return 'Error';
        }
    }

    // Xử lý các nút đặc biệt
    function handleSpecialButton(buttonText) {
        switch (buttonText) {
            case 'C': // Clear All
                currentInput = '0';
                calculationString = '';
                lastButtonIsOperator = false;
                hasResult = false;
                break;
            case 'CE': // Clear Entry 
                currentInput = '0';
                hasResult = false;
                break;
            case 'backspace': // Xử lý xóa từng phần tử
                if (hasResult) {
                    // Không làm gì nếu đang hiển thị kết quả
                    return;
                }

                if (currentInput !== '0' && !lastButtonIsOperator) {
                    // Trường hợp 1: Đang nhập số (currentInput)
                    currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
                } else if (lastButtonIsOperator && calculationString.length > 0) {
                    // Trường hợp 2: Toán tử cuối cùng trong calculationString
                    // Xóa toán tử cuối cùng
                    calculationString = calculationString.slice(0, -1);
                    lastButtonIsOperator = false; 

                    // Khôi phục số cuối cùng từ calculationString về currentInput
                    // Tìm số ở cuối chuỗi calculationString
                    const match = calculationString.match(/(\d+\.?\d*)$/);
                    if (match) {
                        currentInput = match[1]; // Lấy phần số đã khớp
                        calculationString = calculationString.slice(0, -match[1].length); // Xóa số đó khỏi calculationString
                    } else {
                        // Nếu không tìm thấy số, currentInput vẫn là '0'
                        currentInput = '0';
                    }
                } else if (currentInput === '0' && calculationString.length > 0) {
                    // Trường hợp 3: currentInput là '0' và có calculationString 
                    const lastChar = calculationString.slice(-1);

                    // Kiểm tra xem ký tự cuối cùng trong calculationString là số hay toán tử
                    if (['+', '-', 'x', '÷'].includes(lastChar)) {
                        // Nếu là toán tử, xóa toán tử đó
                        calculationString = calculationString.slice(0, -1);
                        // Khôi phục số liền trước toán tử đó
                        const match = calculationString.match(/(\d+\.?\d*)$/);
                        if (match) {
                            currentInput = match[1];
                            calculationString = calculationString.slice(0, -match[1].length);
                        } else {
                            currentInput = '0';
                        }
                    } else {
                        // Nếu là số (hoặc dấu chấm của số), thì đó là phần cuối cùng của số
                        // Cần lùi lại từng ký tự của số đó
                        const lastNumMatch = calculationString.match(/(\d+\.?\d*)$/);
                        if (lastNumMatch) {
                            let lastNum = lastNumMatch[1];
                            lastNum = lastNum.slice(0, -1); // Xóa 1 ký tự
                            if (lastNum === '' || lastNum === '-') { // Nếu số rỗng hoặc chỉ còn dấu âm
                                currentInput = '0';
                                calculationString = calculationString.slice(0, -lastNumMatch[0].length); // Xóa số cũ khỏi chuỗi
                            } else {
                                currentInput = lastNum;
                                calculationString = calculationString.slice(0, -lastNumMatch[0].length) + lastNum; // Cập nhật lại số trong chuỗi
                            }
                        } else {
                            currentInput = '0';
                        }
                    }
                } else {
                    // Nếu không có gì để xóa 
                    currentInput = '0';
                }
                break;
            case '±': // Toggle Sign 
                if (currentInput !== '0' && !isNaN(parseFloat(currentInput))) {
                    currentInput = String(parseFloat(currentInput) * -1);
                }
                hasResult = false;
                break;
            case '%': // Percentage
                if (!isNaN(parseFloat(currentInput))) {
                    currentInput = String(parseFloat(currentInput) / 100);
                }
                hasResult = false;
                break;
            case '¹/x': // 1/x
                const val1x = parseFloat(currentInput);
                if (val1x !== 0 && !isNaN(val1x)) {
                    currentInput = String(1 / val1x);
                } else {
                    currentInput = 'Error';
                }
                hasResult = false;
                break;
            case 'x²': // x squared
                const valX2 = parseFloat(currentInput);
                if (!isNaN(valX2)) {
                    currentInput = String(valX2 * valX2);
                } else {
                    currentInput = 'Error';
                }
                hasResult = false;
                break;
            case '√x': // Square root 
                const valSqrt = parseFloat(currentInput);
                if (valSqrt >= 0 && !isNaN(valSqrt)) {
                    currentInput = String(Math.sqrt(valSqrt));
                } else {
                    currentInput = 'Error';
                }
                hasResult = false;
                break;
            case '=': // Evaluate
                if (calculationString !== '' || (currentInput !== '0' && !hasResult)) {
                    let finalExpression = calculationString + currentInput;
                    if (lastButtonIsOperator) {
                        finalExpression = calculationString.slice(0, -1); // Loại bỏ toán tử cuối cùng nếu có
                    }
                    currentInput = evaluateExpression(finalExpression);
                    calculationString = ''; // Xóa chuỗi tính toán sau khi có kết quả
                    hasResult = true; // Đánh dấu đã có kết quả
                    lastButtonIsOperator = false;
                }
                break;
            default:
                break;
        }
        updateDisplay();
    }

    // Thêm sự kiện click cho tất cả các nút
    buttonsGrid.addEventListener('click', (event) => {
        const { target } = event;

        if (!target.matches('button')) {
            return;
        }

        if (target.classList.contains('btn-num')) {
            inputDigit(target.textContent);
            return;
        }

        if (target.classList.contains('btn-dot')) {
            inputDecimal(target.textContent);
            return;
        }

        if (target.classList.contains('btn-operator')) {
            if (target.textContent !== '=') {
                handleOperator(target.textContent);
            } else {
                handleSpecialButton(target.textContent); // Gọi "=" qua handleSpecialButton
            }
            return;
        }

        if (target.classList.contains('btn-special') || target.classList.contains('btn-backspace') || target.classList.contains('btn-toggle-sign')) {
            const buttonText = target.textContent.trim();
            if (buttonText === '') { // Trường hợp nút backspace có span icon
                handleSpecialButton('backspace');
            } else {
                handleSpecialButton(buttonText);
            }
            return;
        }
    });

    updateDisplay(); // Khởi tạo hiển thị
});