import AddressParser from "../../src/models/address-parser"
import { ScriptHashType } from "../../src/models/chain/script"

describe('AddressParser', () => {
  const fullAddressInfo = {
    address: 'ckb1qjda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xw3vumhs9nvu786dj9p0q5elx66t24n3kxgj53qks',
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    args: '0xb39bbc0b3673c7d36450bc14cfcdad2d559c6c64',
    hashType: ScriptHashType.Type
  }

  const shortAddressInfo = {
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    args: '0x36c329ed630d6ce750712a477543672adab57f4c',
    hashType: ScriptHashType.Type,
    address: 'ckt1qyqrdsefa43s6m882pcj53m4gdnj4k440axqswmu83',
  }

  const multiSignAddressInfo = {
    address: 'ckb1qyq5lv479ewscx3ms620sv34pgeuz6zagaaqklhtgg',
    hashType: ScriptHashType.Type,
    args: '0x4fb2be2e5d0c1a3b8694f832350a33c1685d477a',
    codeHash: '0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8'
  }

  describe('parse', () => {
    it('full address', () => {
      const script = new AddressParser(fullAddressInfo.address).parse()
      expect(script.codeHash).toEqual(fullAddressInfo.codeHash)
      expect(script.args).toEqual(fullAddressInfo.args)
      expect(script.hashType).toEqual(fullAddressInfo.hashType)
    })

    it('short address', () => {
      const script = new AddressParser(shortAddressInfo.address).parse()
      expect(script.codeHash).toEqual(shortAddressInfo.codeHash)
      expect(script.args).toEqual(shortAddressInfo.args)
      expect(script.hashType).toEqual(shortAddressInfo.hashType)
    })

    it ('multi sign short address', () => {
      const script = new AddressParser(multiSignAddressInfo.address).parse()
      expect(script.codeHash).toEqual(multiSignAddressInfo.codeHash)
      expect(script.args).toEqual(multiSignAddressInfo.args)
      expect(script.hashType).toEqual(multiSignAddressInfo.hashType)
    })
  })

})
