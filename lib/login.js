const crypto = require('crypto'); // 암호화에 필요한 모듈을 import 한다.
const members = require('../members/members.js') // 멤버 목록을 받아온다.

// 객체를 export 한다.
module.exports = {
    'encrypt' : function (text) { //text라는 인자를 받는 암호화 함수를 만든다.
    // 예외 처리 구문을 작성한다.
        try {
            var cipher = crypto.createCipher('aes-256-cbc','231323'); // Cipher객체를 생성한다.
            var crypted = cipher.update(text,'utf8','hex'); // 인코딩 방식에 따라 암호화한다.
            crypted += cipher.final('hex'); // 암호화한 결과를 덧붙인다.
            return crypted; // 암호화한 값을 리턴한다.
        } catch {
            // 에러가 났을 경우 'error'를 암호화한다.
            var cipher = crypto.createCipher('aes-256-cbc','231323');
            var crypted = cipher.update('error','utf8','hex');
            crypted += cipher.final('hex');
            return crypted;
        }
    },
    'decrypt' : function(text) { // text라는 인자를 받는 복호화 함수를 만든다.
        try {
            var decipher = crypto.createDecipher('aes-256-cbc','231323')
            var dec = decipher.update(text,'hex','utf8')
            dec += decipher.final('utf8');
            return dec;
        } catch {
            var decipher = crypto.createDecipher('aes-256-cbc','231323')
            var dec = decipher.update('error','hex','utf8')
            dec += decipher.final('utf8');
            return dec;
        }
    }, 
    'compare' : function(pass) {
    // 예외 처리 구문을 작성한다.
        try {
            var i = 0; // i 변수를 만든다.
            while (i<members.length) { // i가 멤버의 길이보다 짧은 동안 반복한다.
                if (pass == members[i][0]) { //멤버의 i의 0을 하나하나 바교하고 같다면 members의 i의 1을 리턴한다.
                    return members[i][1];
                }
                i = i + 1;
            }
            return 'false'; //여기 까지와도 없다면 false를 리턴한다.
        } catch {
            return 'error'; // 에러가 있다면 error을 리턴한다.
        }
    }
}
