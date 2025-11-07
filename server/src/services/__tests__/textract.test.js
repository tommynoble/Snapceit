import textractService from '../textract';

describe('TextractService', () => {
    describe('getS3Details', () => {
        it('should correctly parse S3 URL', () => {
            const url = 'https://snapceit.s3.us-east-1.amazonaws.com/receipts/user123/receipt.jpg';
            const result = textractService.constructor.getS3Details(url);
            
            expect(result).toEqual({
                bucket: 'snapceit',
                key: 'receipts/user123/receipt.jpg'
            });
        });

        it('should throw error for invalid URL', () => {
            const url = 'invalid-url';
            expect(() => {
                textractService.constructor.getS3Details(url);
            }).toThrow('Invalid S3 URL format');
        });
    });
});
