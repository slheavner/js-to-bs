function api() {
  return {
    newVideoGridItem: (video, root) => {
      const node = new roSGNode('ContentNode')
      node.setFields({
        hdposterurl: root + video.thumb,
        shortDescriptionLine1: video.title,
        shortDescriptionLine2: video.subtitle,
      })
      return node
    },
    newVideoGrid: data => {
      const root = new roSGNode('ContentNode')
      for (let video in data.categories[0].videos) {
        root.appendChild(this.newVideoGridItem(video, data.root))
      }
      return root
    },
    newVideoPlayAction: video => {
      const node = new roSGNode('ContentNode')
      node.setFields({
        url: video.sources[0],
      })
      return {
        visible: true,
        control: 'play',
        content: node,
      }
    },
  }
}
