/**
  * Utility to convert numbers to Thai Baht text (เช่น 42500 -> สี่หมื่นสองพันห้าร้อยบาทถ้วน)
  */
 export function thaiBahtText(amount: number): string {
   if (isNaN(amount) || amount === 0) return 'ศูนย์บาทถ้วน';

   const numbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
   const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

   const numStr = amount.toFixed(2);
   const [integerPart, decimalPart] = numStr.split('.');

   function convertPart(str: string): string {
     let result = '';
     const len = str.length;
     for (let i = 0; i < len; i++) {
       const digit = parseInt(str[i], 10);
       const pos = len - 1 - i;

       if (digit !== 0) {
         if (pos === 1 && digit === 1) {
           result += 'สิบ';
         } else if (pos === 1 && digit === 2) {
           result += 'ยี่สิบ';
         } else if (pos === 0 && digit === 1 && len > 1) {
           result += 'เอ็ด';
         } else {
           result += numbers[digit] + positions[pos % 6];
         }
       }
     }
     return result;
   }

   let bahtText = convertPart(integerPart) + 'บาท';

   if (!decimalPart || decimalPart === '00') {
     bahtText += 'ถ้วน';
   } else {
     const satangText = convertPart(decimalPart);
     bahtText += satangText + 'สตางค์';
   }

   return bahtText;
 }
