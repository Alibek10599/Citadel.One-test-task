/*
 * Данный скрипт является завершенным и самодостаточным,
 * он не является частью чего-то большего,
 * по этому стоит воспринимать его как готовый проект.
 * Соответственно ваш исправленный скрипт так же будет оцениваться
 * как готовое решение со всеми приложенными файлами.
 * В задачах ошибок нет и стоит быть внимательным при решении проблем.
 * Так же допускается пропуск одной из задач.
 * 
 * Задачи:
 * 1) Исправить ошибки в скрипте
 * 2) Оптимизировать его приведя в "красивый" вид
 * 3) Сократить потребление оперативной памяти
 * 4) Сократить время исполнения скрипта
 * 5) Посчитать комиссию, которую получит каждый бейкер с блока 832543 по 832546 включительно
 */
'use strict'

const axios = require('axios');

const start = new Date().getTime();
const time = () => (new Date().getTime() - start)/1000;
const address = 'tz1TaLYBeGZD3yKVHQGBM857CcNnFFNceLYh';

class TezosBlock
{
  constructor(number){
    this.number = number;
    this.data = null;
  }
  async loadData(){ // Выгружаем данные из публичной ноды (альтернативные ноды: https://tezostaquito.io/docs/rpc_nodes/)
    this.data = (await axios.get('https://jakartanet.smartpy.io/chains/main/blocks/'+this.number)).data;
  }
}

(async function(){

  // Загружаем список необходмых блоков
  const list = [];
  for(let block = 832543; block < 832547; block++){
    const Block = new TezosBlock(block);
    await Block.loadData();
    list.push(Block.data);
  }

  // Получаем транзакции
  const transactions = [];
  let index = 0;
  while(list[index]){
    let batchs = list[index].operations;
    let batch, batch_index = 0;
    while((batch = batchs[batch_index]) && ++batch_index) batch.map(row => transactions.push(row));
    index++;
  }

  // Считаем комиссии для бейкеров
  const bakers_fees = {};
  bakers_fees[address] = 0;
  for (const tx of transactions){
    if(!tx.contents) continue;
    tx.contents.map(row => {
      if (row.kind === 'transaction') {
        bakers_fees[address] +=  parseInt(row.fee);
      }
    });
  }

  // Выводим результат
  console.log('Count transactions', transactions.length);
  console.log('Bakers fees', bakers_fees);
  console.log('Memory (heapUsed, MB)', Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100);
  console.log('Time (seconds)', time());
})();

