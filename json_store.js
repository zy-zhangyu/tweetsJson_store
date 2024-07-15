const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// MongoDB 连接 URI
const uri = 'mongodb+srv://dubai52233:Aaqweqweqwe123@cluster0.5p8on8l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // 根据您的 MongoDB 配置修改

// 设置 JSON 文件的路径
let jsonFilePath = ''; // 初始为空

// 设置 JSON 文件的路径
app.get('/setJsonUrl', async (req, res) => {
    try {
        jsonFilePath = req.query.jsonUrl;

        // 读取 JSON 文件并插入到 MongoDB
        await insertJSONDataToMongoDB(jsonFilePath);

        res.json({ message: '数据插入成功。' });
    } catch (error) {
        res.status(500).json({ error: '发生错误：' + error.message });
    }
});

async function insertJSONDataToMongoDB(filePath) {
    try {
        // 连接 MongoDB
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const database = client.db('Blastai');
        const collection = database.collection('Blastai');

        // 查询集合中已有文档数量
        const countDocuments = await collection.countDocuments();
        const startId = countDocuments + 1; // 计算起始 _id

        // 读取 JSON 文件
        const jsonData = await fs.readFile(filePath, 'utf8');
        const parsedData = JSON.parse(jsonData);

        // 设置每个文档的 _id，并插入数据
        const jsonDataWithIds = parsedData.map((doc, index) => ({
            _id: startId + index,
            ...doc
        }));

        const result = await collection.insertMany(jsonDataWithIds);
        console.log(`${result.insertedCount} documents inserted.`);

        await client.close();
    } catch (error) {
        throw new Error('插入数据到 MongoDB 出错：' + error.message);
    }
}



app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});
