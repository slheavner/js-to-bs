function RunUserInterface(params) {
  date = new roDateTime()
  print(`App Start Time: ${date.toISOString()}`)
  showScene(params)
}

function showScene(params) {
  print(params)

  this.screen = new roSGScreen()
  this.port = new roMessagePort()
  this.screen.setMessagePort(this.port)
  this.screen.createScene('MyScene')
  const data = parseJson(ReadAsciiFile('pkg:/resources/api.json'))
  this.screen.getGlobalNode().addFields({
    api: data,
  })
  this.screen.show()

  while (true) {
    msg = wait(0, this.port)
    msgType = type(msg)
    if ((msgType = 'roSGScreenEvent')) {
      if (msg.isScreenClosed()) {
        print('Closing app')
      }
    }
  }
}
