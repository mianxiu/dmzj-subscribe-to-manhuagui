const puppeteer = require('puppeteer-core');
const _cliProgress = require('cli-progress');
const fs = require('fs')

// 20190217 扫描动漫之家漫画订阅  -> 同步到漫画柜


const dmzjBar = new _cliProgress.Bar({
  format: '扫描动漫之家订阅 [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
  barsize: 20
}, _cliProgress.Presets.legacy)
const mhgBar = new _cliProgress.Bar({
  format: '漫画柜添加订阅 [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
  barsize: 20
}, _cliProgress.Presets.rect)


const dmzjSub = 'https://i.dmzj.com//subscribe'
const mhgWeb = 'https://www.manhuagui.com/comic/0001/'


// 读取cookie
let setting = JSON.parse(fs.readFileSync('./setting.json', 'utf-8'))

// all cookie
let dmzjCookie = setting.dmzjCookie
let mhgCookie = setting.mhgCookie

let browseSetting = {
  headless: false,
  executablePath: setting.chromePath
}


// 读取动漫之家订阅
let dmzjMangaTitle = []
let dmzj = (async () => {
  // progres
  const browser = await puppeteer.launch(browseSetting);
  const page = await browser.newPage();
  await page.setCookie(...dmzjCookie)
  await page.goto(dmzjSub);

  const maxPageNum = await page.$eval('#page_id>a:nth-last-child(3)', e => e.innerText)

  // progress
  dmzjBar.start(maxPageNum, 0)

  let info = {
    url: 'https://i.dmzj.com/ajax/my/subscribe',
    currentPage: 1
  }

  for (let i = 0; i < maxPageNum; i++) {
    // progree update
    dmzjBar.update(i + 1)

    info.currentPage = i

    let list = await page.evaluate((info) => {

      const data = new FormData()
      data.append('page', info.currentPage + 1)
      data.append('type_id', 1)
      data.append('letter_id', 0)
      data.append('read_id', 1)

      return fetch(info.url, {
        method: 'POST',
        body: data,
      })
        .then(res => {
          return res.text()
            .then(text => {
              return text
                .replace(/<a.+?>/gm, '')
                .match(/3>.+?</gm)
                .map(e => e.slice(2, -1))
            })
        })

    }, info)



    dmzjMangaTitle.push.apply(dmzjMangaTitle, list)
    setting.dmzjMaxPage = maxPageNum
  }

  dmzjBar.stop()

  fs.writeFileSync('./mangaList.log', JSON.stringify(dmzjMangaTitle))
  //fs.writeFileSync('./setting.json', JSON.stringify(setting))
  //console.log(JSON.parse(fs.readFileSync('./mangaList.log','utf-8')))
  browser.close()

  mhg()

})

dmzj()

let bookId = []
// 漫画柜 订阅
let mhg = (async () => {

  const searchKey = 'https://www.manhuagui.com/tools/word.ashx?key='
  const postKey = '/tools/submit_ajax.ashx?action=user_book_shelf_add'
  // progress
  mhgBar.start(dmzjMangaTitle.length, 0)

  const browser = await puppeteer.launch(browseSetting);
  const page = await browser.newPage();
  await page.setCookie(...mhgCookie)
  await page.goto(mhgWeb)

  // 查询 book cid
  let sleep1 = 0
  for (let i = 0; i < dmzjMangaTitle.length; i++) {

    if (sleep1 === 100) {
      await page.waitFor(5000)
      sleep1 = 0
    }

    // 查询漫画id
    let url = searchKey + encodeURI(dmzjMangaTitle[i])

    let book_id = await page.evaluate((url) => {
      return fetch(url, {
        method: 'GET'
      }).then(res => {
        return res.json().then(json => {
          if (json.length > 0) {
            return json[0].u.match(/\d{1,}/)[0]
          } else {
            return 0
          }
        })
      })
    }, url)



    // 添加订阅
    await page.evaluate((id, postUrl) => {
      const bookData = new FormData()
      bookData.append('book_id', id)
      return fetch(postUrl, {
        method: 'POST',
        body: bookData
      }).then(() => { })
    }, book_id, postKey)

    mhgBar.update(i)
    bookId.push(book_id)
    sleep1++

  }

  mhgBar.stop()
  fs.writeFileSync('./bookId.log', JSON.stringify(bookId))
  browser.close()

})

