const minLen = 3;
const maxLen = 4;
const range = {
    min: 97,
    max: 122,
};

function increment(long) {
    if(!long.length) {
        long.push(range.min);
        return long;
    }
    
    let low = long.pop();
    if (low < range.max) {
        low++;
    } else {
        increment(long);
        if(long.length === maxLen) {
            return null;
        }

        low = range.min;
    }
    
    long.push(low);
    return long;
}

function fromCharCodes(codes) {
    return codes && codes.reduce((r, c) => {
        return r + String.fromCharCode(c);
    }, '');
}

module.exports = {
    create: function() {
        const codes = [];
        let i = minLen - 1;
        while(i--) {
            codes.push(range.max);
        }
        
        return {
            next: function() {
                return fromCharCodes(increment(codes));
            },
        }
    }
}