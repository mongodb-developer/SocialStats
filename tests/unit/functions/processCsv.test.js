const processCsv = require('../../../functions/processCsv/source.js');

beforeEach(() => {

    // Mock the storeCsvInDB function to return true
    global.context = {
        functions: {
            execute: jest.fn((functionName, anyParam) => { return true; })
        }
    }
});


test('Simple', () => {
    const csv = "data:text/csv;base64,SGkgTGF1cmVu";
    expect(processCsv(csv)).toBe(true);
    expect(context.functions.execute).toHaveBeenCalledWith("storeCsvInDb", "Hi Lauren");
})


