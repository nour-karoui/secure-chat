var forge = require('node-forge');

export const certif = () => {
    //var rsa = new RSA();
    // generate a key pair
    const keys = forge.pki.rsa.generateKeyPair(1024);
    const priKey = forge.pki.privateKeyToPem(keys.privateKey);
    const pubKey = forge.pki.publicKeyToPem(keys.publicKey);
    localStorage.setItem('priKey', priKey);
    localStorage.setItem('pubKey', pubKey);
    // create a certification request (CSR)
    const csr = forge.pki.createCertificationRequest();
    csr.publicKey = keys.publicKey;
    csr.setSubject([{
        name: 'commonName',
        value: 'example.org'
    }, {
        name: 'countryName',
        value: 'US'
    }, {
        shortName: 'ST',
        value: 'Virginia'
    }, {
        name: 'localityName',
        value: 'Blacksburg'
    }, {
        name: 'organizationName',
        value: 'Test'
    }, {
        shortName: 'OU',
        value: 'Test'
    }]);
// set (optional) attributes
    csr.setAttributes([{
        name: 'challengePassword',
        value: 'password'
    }, {
        name: 'unstructuredName',
        value: 'My Company, Inc.'
    }, {
        name: 'extensionRequest',
        extensions: [{
            name: 'subjectAltName',
            altNames: [{
                // 2 is DNS type
                type: 2,
                value: 'test.domain.com'
            }, {
                type: 2,
                value: 'other.domain.com',
            }, {
                type: 2,
                value: 'www.domain.net'
            }]
        }]
    }]);

    csr.sign(keys.privateKey);
    const pem = forge.pki.certificationRequestToPem(csr);
    return(pem);
}
