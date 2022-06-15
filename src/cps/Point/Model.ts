import Graph from '../Graph'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil'
import type Properties from '../Graph'

type ModelProperties = Properties & {
  uri: string
}

export default class Model extends Graph {

  maxPointNum:number = 1
  minPointNum:number = 1

  constructor (p: ModelProperties, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '3D模型',
      scale: 30,
      uri: 'station.gltf',
      ...p
    }, viewer, layer)
    this.propDefs.push(
      { name: 'scale', title: '缩放', type: 'number', editable: true, min: 10, max: 100, step: 1 },
      { name: 'uri', title: '模型', type: 'string', editable: false},
    )
  }

  initShape() {
    let ent = this.entities.add(new Cesium.Entity({model: {}}))
    this.fillShape(ent)
    Object.assign(ent.model, {
      uri: new Cesium.CallbackProperty((time, result) => '/model/' + this.props.uri, true),
      scale: new Cesium.CallbackProperty((time, result) => this.props.scale, true),
      color: new Cesium.CallbackProperty((time, result) => {
        let c = Cesium.Color.fromCssColorString(this.props.color).withAlpha(this.props.alpha)
        return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
      }, true)
    })
    ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.ctls.concat(window.cursor), time)
    }, false)
  }

  calcuteShape (points, time) {
    if (points.length < this.minPointNum) {
      return []
    }
    return points[0].position.getValue(time)
  }

  toEdit () {
    super.toEdit()
    this.shapes[0].position = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.ctls, time)
    }, false)
  }

  finish () {
    if (this.shapes.length>0) {
      super.finish()
      this.shapes[0].position = this.calcuteShape(this.ctls, mu.julianDate())
    }
  }
}
