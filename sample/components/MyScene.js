function init() {
  this.top.backgroundColor = '0xEB1010FF'
  print('thing'.charAt(4))
  print('first'.concat(' ', 'second, ', ' thrid'))
  print('endswith'.endsWith('with'))

  print([1, 2, 4].includes(2))

  this.data = this.global.api
  this.api = api()
  this.grid = this.top.findNode('contentGrid')
  this.videoPlayer = this.top.findNode('videoPlayer')
  this.grid.observeField('itemSelected', 'onVideoSelected')
  this.grid.content = this.api.newVideoGrid(m.data)
  this.grid.setFocus(true)
}

function onKeyEvent(key, press) {
  if (key === 'back' && this.videoPlayer.hasFocus() === true) {
    this.videoPlayer.setFields({
      visible: false,
      control: 'pause',
    })
    this.grid.setFocus(true)
    return true
  }
  return false
}

function onVideoSelected(msg) {
  playVideo(this.data.categories[0].videos[this.grid.itemSelected])
}

function playVideo(video) {
  this.videoPlayer.setFields(this.api.newVideoPlayAction(video))
  this.videoPlayer.setFocus(true)
}
