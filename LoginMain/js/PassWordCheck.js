var PasswordComplexValid = false;
$(document).ready(function () {
    var password = $('#txtPassword');
  
    password.keyup(function () {
        $('#result').html(checkStrength(password.val()))
    })
    function checkStrength(password) {
        PasswordComplexValid = false;
        var strength = 0
        if (password.length < 5) {
            $('#result').removeClass()
            $('#result').addClass('short');
            $('#progressBar').removeClass();
            $('#progressBar').width('30%');
            $('#progressBar').addClass('progress-bar progress-bar-danger');

            return 'رمز عبور باید حداقل 5 کاراکتر باشد'
        }
        if (password.length > 7) strength += 1
        // If password contains both lower and uppercase characters, increase strength value.
        if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1
        // If it has numbers and characters, increase strength value.
        if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1
        // If it has one special character, increase strength value.
        if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
        // If it has two special characters, increase strength value.
        if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
        // Calculated strength value, we can return messages
        // If value is less than 2
        if (strength < 2) {
            $('#result').removeClass()
            $('#result').addClass('weak')
            $('#progressBar').removeClass();
            $('#progressBar').width('30%');
            $('#progressBar').addClass('progress-bar progress-bar-danger');
            return 'ضعیف';
        }
        else if (strength == 2) {
            $('#result').removeClass()
            $('#result').addClass('good')
            $('#progressBar').removeClass();
            $('#progressBar').width('70%');
            $('#progressBar').addClass('progress-bar progress-bar-blue');
            return 'خوب'
        }
        else {
            PasswordComplexValid = true;
            $('#result').removeClass()
            $('#result').addClass('strong');
            $('#progressBar').removeClass();
            $('#progressBar').width('100%');
            $('#progressBar').addClass('progress-bar progress-bar-success');
            return 'پیچیده'
        }
    }
});
