const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}
async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }

}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} vendas`);
      }
}

// Função auxiliar para verificar se realmente existem produtos na mensagem sendo processada
function hasProducts(order) {
    return Array.isArray(order.products) && order.products.length > 0;
}

async function processMessage(msg) {
    const orderData = JSON.parse(msg.content);
    try {
        if(hasProducts(orderData)) {
            await updateReport(orderData.products);
            await printReport();
        }else {
            console.log("X ERRO: O PEDIDO PROCESSADO NÃO POSSUI NENHUM PRODUTO. RELATÓRIO INALTERADO!")
        }
    }catch(error) {
        console.log(`X ERROR TO PROCESS: ${error}`);
    }
}

async function consume() {
    console.log(`Inscrito com sucesso na fila ${process.env.RABBITMQ_QUEUE_NAME}`)
    await (await RabbitMQService.getInstance()).consume(process.env.RABBITMQ_QUEUE_NAME, (msg) => processMessage(msg));
} 

consume()
