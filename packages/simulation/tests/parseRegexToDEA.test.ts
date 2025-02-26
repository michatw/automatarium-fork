import parseRegexToDEA from "../src/parseRegexToDEA";
import parseRegexToDEA10 from "./graphs/parseRegexToDEA_10.json";
import parseRegexToDEA1plus0 from "./graphs/parseRegexToDEA_1+0.json";
import parseRegexToDEA1KleeneStar from "./graphs/parseRegexToDEA_1*.json";
import parseRegexToDEA1plus0_KleeneStar from "./graphs/parseRegexToDEA_1+0_*.json";
import parseRegexToDEA1plus0KleeneStar from "./graphs/parseRegexToDEA_1+0*.json";
import parseRegexToDEA1plus0_1_0KleeneStar from "./graphs/parseRegexToDEA_1+0_1_0*.json";
import parseRegexToDEA_1plus0_1_02KleeneStar from "./graphs/parseRegexToDEA_1+0_1_02*.json";
import parseRegexToDEA_1plus0_multipleBrackets from "./graphs/parseRegexToDEA_1+0_multipleBrackets.json";
import parseRegexToDEA_1_0plus1KleeneStar_KleeneStar from "./graphs/parseRegexToDEA_1_0+1*_*.json";
import parseRegexToDEA_1KleeneStar_NoBrackets from "./graphs/parseRegexToDEA_1*.json";
import parseRegexToDEA_1KleeneStar_0_NoBrackets from "./graphs/parseRegexToDEA_1*+0_noBrackets.json";
import parseRegexToDEA_1KleeneStar_1plus0_noBrackets from "./graphs/parseRegexToDEA_1*_1+0_noBrackets.json";
import parseRegexToDEA_20_2plus1_1KleeneStar_noBrackets from "./graphs/parseRegexToDEA_20_2+1_1*_withoutBrackets.json";
import parseRegexToDEA_aplusbpluscKleeneStar_abc_aplusbpluscKleeneStar from "./graphs/parseRegexToDEA_a+b+c_*abc_a+b+c_*.json";
import parseRegexToDEA_aplusbpluscKleeneStar_KleeneStar from "./graphs/parseRegexToDEA_a+b+c_*_*.json";
import parseRegexToDEA_aplusbpluscKleeneStar_KleeneStar_d from "./graphs/parseRegexToDEA_a+b+c_*_*d.json";
import parseRegexToDEA__aaKleeneStarbbKleeneStarccKleeneStar_ from "./graphs/parseRegexToDEA_aa*bb*cc*_.json"
import parseRegexToDEA__aa_ from "./graphs/parseRegexToDEA__aa_.json"

describe('parseRegexToDEA', () => {
    test('should return a DEA for a simple concatenated dea', () => {
        const regex = '10';
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA10);
    })

    test('should return a DEA for a simple alternation dea', () => {
        const regex = '1+0';
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA1plus0);
    })

    test('should return a DEA for a simple kleene star dea', () => {
        const regex = '(1)*';
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA1KleeneStar);
    })

    test('should return a DEA for a simple kleene star alternation dea', () => {
        const regex = '(1+0)*';
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA1plus0_KleeneStar);
    })

    test('should return a DEA for a simple alternation followed by kleene star dea', () => {
        const regex = '1+(0)*';
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA1plus0KleeneStar);
    })

    test('quite complicated combined regex', () => {
        const regex = '(1+0)1(0)*';
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA1plus0_1_0KleeneStar);  
    })

    test('another quite complicated combined regex', () => {
        const regex = '(1+0)1(02)*';
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA_1plus0_1_02KleeneStar);
    }) 

    test('nested brackets working aswell', () => {
        const regex = '((1+0))';
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA_1plus0_multipleBrackets)
    })

    test ('nested brackets with multiple kleene stars and onyl a few characters', () => {
      const regex = '(1(0+1)*)*'
      const dea = parseRegexToDEA(regex);
      expect(dea).toEqual(parseRegexToDEA_1_0plus1KleeneStar_KleeneStar);
    })

    test('kleene star without brackets', () => {
        const regex = '1*';
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA_1KleeneStar_NoBrackets);
    })

    test('plus and kleene start without brackets combined', () => {
        const regex = '1*+0';
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA_1KleeneStar_0_NoBrackets);
    })

    test('plus and kleene star without brackets combined in a more complicated way', () => {
        const regex = '1*(1+0)';
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA_1KleeneStar_1plus0_noBrackets);
    })

    test('test multiple characters and kleene star without brackets', () => {
        const regex = '20(2+0)1*'
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA_20_2plus1_1KleeneStar_noBrackets);
    })

    test('test complex regex with abc and kleene star and plus combined', () => {
        const regex = '(a+b+c)*abc(a+b+c)*'
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA_aplusbpluscKleeneStar_abc_aplusbpluscKleeneStar);
    })

    test('test multiple kleenestars combined with three characters', () => {
        const regex = '((a+b+c)*)*'
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA_aplusbpluscKleeneStar_KleeneStar);
    })

    test('test multiple kleenestars combined with three characters and another character following', () => {
        const regex = '((a+b+c)*)*d'
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA_aplusbpluscKleeneStar_KleeneStar_d);
    })

    test('test multiple characters with kleenestars and unnecassary brackets', () => {
        const regex = '(aa*bb*cc*)'
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA__aaKleeneStarbbKleeneStarccKleeneStar_);
    })

    test('test multiple characters with kleenestars and unnecassary brackets - second version', () => {
        const regex = 'aa*bb*(cc*)'
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA__aaKleeneStarbbKleeneStarccKleeneStar_);
    })

    test('two characters without further operators but unnecassary brackets', () => {
        const regex = '(aa)'
        const dea = parseRegexToDEA(regex);
        expect(dea).toEqual(parseRegexToDEA__aa_);
    })

    // This test should be removed when this kind of regex is supported.
    test('should throw an error for problematic regex constructs with plus after brackets', () => {
        const regex = '(a)+b';
        expect(() => parseRegexToDEA(regex)).toThrowError(new Error('Some Regex constructs are known to be produce problems. If your regex includes "(...)*+..." or "(...)+..." try to rewrite it.'));
    })

    // This test should be removed when this kind of regex is supported.
    test('should throw an error for problematic regex constructs with kleene star and plus after brackets', () => {
        const regex = '(a)*+b';
        expect(() => parseRegexToDEA(regex)).toThrowError(new Error('Some Regex constructs are known to be produce problems. If your regex includes "(...)*+..." or "(...)+..." try to rewrite it.'));
    })
})