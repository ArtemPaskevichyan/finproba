document.body.onload = function() {
      document.addEventListener('keyup',  listener)

}



var listener = function(event) {
    if (event.keyCode === 13)
        {
            fieldsPreviousCheckUp('Вход')
        }

};


function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }


console.log([1, 2 ,3][3]);


var PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwvyfsjAzTHAOV9Oje8UqHJ2gW0/Rprw+TyZhpzsReL1tKqtyhOx2DfJ26RMeOSPUA8TsdyOhRQQ3DlSH4HffPWHsven8fzvenrpk5x2sdPWeoBMr+tvT0txXBiBI++gsYTNwKk6YTrXEwLUeWFn+W1BR2u3qkNRzuDgZtsjCYWIrgBoT5EhrzauXXHgdnTVSnLJdh+xCHo6cR6ssM7cE52r+e5qt8Ec9edmVxhIpytOWgQhWPyP6L+CJ3RMhQal9fAkmcHWayprJ/Y7YFHDVtKLUibG7FUXURBuDg/UAQFXYUIQ9wett1Nmz2ujhgljTyozXySSXWzoT+sb6vCraDQIDAQAB"
var json = JSON.stringify({
    "module_id": "15",
    "transaction_key": "26f69247-0a1e-41b9-9a10-39cf3d128744"
  })
var txt = "some text to be encoded"
var finalKey = str2ab(window.atob(PUBLIC_KEY))
var toEncode = new TextEncoder()
toEncode.encode(txt)
console.log(toEncode);

var key = window.crypto.subtle.importKey(
        "spki",
        finalKey,
        {
            "name": "RSA-OAEP",
            "hash": "SHA-256"
        },
        false,
        ["encrypt"]
    )
// var key = window.crypto.subtle.importKey(
//     "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
//     {   //this is an example jwk key, other key types are Uint8Array objects
//         kty: "RSA",
//         e: "AQAB",
//         n: PUBLIC_KEY,
//         alg: "RSA-OAEP-256",
//         ext: true,
//     },
//     {   //these are the algorithm options
//         name: "RSA-OAEP",
//         hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
//     },
//     false, //whether the key is extractable (i.e. can be used in exportKey)
//     ["encrypt"] //"encrypt" or "wrapKey" for public key import or
//                 //"decrypt" or "unwrapKey" for private key imports
// )
    .then(function(key) {
        console.log(key);
        console.log("ENC", window.crypto.subtle.encrypt({name: "RSA-OAEP"}, key, txt)); 
    })



var swiper = new Swiper('.swiper', {
    
})