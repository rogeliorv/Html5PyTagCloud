/**
 * Copyright (C) 2010-2011 Graham Breach
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * TagCanvas 1.7.1
 * For more information, please contact <graham@goat1000.com>
 */
(function(){
var i, j, hexlookup3 = {}, hexlookup2 = {}, hexlookup1 = {
	"0":"0,",   "1":"17,",  "2":"34,",  "3":"51,",  "4":"68,",  "5":"85,",
	"6":"102,", "7":"119,", "8":"136,", "9":"153,", a:"170,",   A:"170,",
	b:"187,",   B:"187,",   c:"204,",   C:"204,",   d:"221,",   D:"221,",
	e:"238,",   E:"238,",   f:"255,",   F:"255,"	
};
for(i = 0; i < 256; ++i) {
	j = i.toString(16);
	if(i < 16)
		j = '0' + j;
	hexlookup2[j] = hexlookup2[j.toUpperCase()] = i.toString() + ',';
}
function PointsOnSphere(n) {
	var i, y, r, phi, pts = [], inc = Math.PI * (3-Math.sqrt(5)), off = 2/n;
	for(i = 0; i < n; ++i) {
		y = i * off - 1 + (off / 2);
		r = Math.sqrt(1 - y*y);
		phi = i * inc;
		pts.push([Math.cos(phi)*r, y, Math.sin(phi)*r]);
	}
	return pts;
};
function SetAlpha(c,a) {
	var d = c, p1, p2, ae = new Number(a).toPrecision(3) + ')';
	if(c[0] === '#') {
		if(!hexlookup3[c])
			if(c.length === 4)
				hexlookup3[c] = 'rgba(' + hexlookup1[c[1]] + hexlookup1[c[2]] + hexlookup1[c[3]];
			else
				hexlookup3[c] = 'rgba(' + hexlookup2[c.substr(1,2)] + hexlookup2[c.substr(3,2)] + hexlookup2[c.substr(5,2)];
		d = hexlookup3[c] + ae;
	} else if(c.substr(0,4) === 'rgb(' || c.substr(0,4) === 'hsl(') {
		d = (c.replace('(','a(').replace(')', ',' + ae));
	} else if(c.substr(0,5) === 'rgba(' || c.substr(0,5) === 'hsla(') {
		p1 = c.lastIndexOf(',') + 1, p2 = c.indexOf(')');
		a *= parseFloat(c.substring(p1,p2));
		d = c.substr(0,p1) + a.toPrecision(3) + ')';
	} else {
		d = c; // give up!
	}
	return d;
};
function NewCanvas(w,h) {
	// if using excanvas, give up now
	if(window.G_vmlCanvasManager)
		return null;
	var c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	return c;
};
function ShadowAlphaBroken() {
	var cv = NewCanvas(3,3), c, i;
	if(!cv)
		return false;
	c = cv.getContext('2d');
	c.strokeStyle = '#000';
	c.shadowColor = '#fff';
	c.shadowBlur = '3';
	c.globalAlpha = 0.0;
	c.strokeRect(2,2,2,2);
	c.globalAlpha = 1.0;
	i = c.getImageData(2,2,1,1);
	cv = null;
	return (i.data[0] > 0);
};
function FindGradientColour(t,p) {
	var l = 1024, g = t.weightGradient, cv, c, i, gd, d;
	if(t.gCanvas) {
		c = t.gCanvas.getContext('2d');
	} else {
		t.gCanvas = cv = NewCanvas(l,1);
		if(!cv)
			return null;
		c = cv.getContext('2d');
		gd = c.createLinearGradient(0,0,l,0);
		for(i in g)
			gd.addColorStop(1-i, g[i]);
		c.fillStyle = gd;
		c.fillRect(0,0,l,1);
	}
	d = c.getImageData(~~((l-1)*p),0,1,1).data;
	return 'rgba(' + d[0] + ',' + d[1] + ',' + d[2] + ',' + (d[3]/255) + ')';
};
function FindTextBoundingBox(s,f,ht) {
	var w = parseInt(s.length * ht), h = parseInt(ht * 2), cv = NewCanvas(w,h), c, idata, w1, h1, x, y, i, ex;
	if(!cv)
		return null;
	c = cv.getContext('2d');
	c.fillStyle = '#000';
	c.fillRect(0,0,w,h);
	c.font = f;
	c.textHeight = ht;
	c.textBaseline = 'top';
	c.fillStyle = '#fff';
	c.font = ht + 'px ' + f;
	c.fillText(s, 0, 0);

	idata = c.getImageData(0,0,w,h);
	w1 = idata.width; h1 = idata.height;
	ex = {
		min: { x: w1, y: h1 },
		max: { x: -1, y: -1 }
	};
	for(y = 0; y < h1; ++y) {
		for(x = 0; x < w1; ++x) {
			i = (y * w1 + x) * 4;
			if(idata.data[i+1] > 0) {
				if(x < ex.min.x) ex.min.x = x;
				if(x > ex.max.x) ex.max.x = x;
				if(y < ex.min.y) ex.min.y = y;
				if(y > ex.max.y) ex.max.y = y;
			}
		}
	}
	// device pixels might not be css pixels
	if(w1 != w) {
		ex.min.x *= (w / w1);
		ex.max.x *= (w / w1);
	}
	if(h1 != h) {
		ex.min.y *= (w / h1);
		ex.max.y *= (w / h1);
	}

	cv = null;
	return ex;
};
function FixFont(f) {
	return "'" + f.replace(/(\'|\")/g,'').replace(/\s*,\s*/g, "', '") + "'";
};
function AddHandler(h,f,e) {
	if(!e) e = document;
	if(e.addEventListener)
		e.addEventListener(h,f,false);
	else
		e.attachEvent('on' + h, f);
};
function AddImage(i,t,tl) {
	if(i.complete) {
		t.w = i.width;
		t.h = i.height;
		tl.push(t);
	} else {
		AddHandler('load',function() {
			t.w = this.width;
			t.h = this.height;
			tl.push(t);
		},i);
	}
};
function FindWeight(t,a) {
	var w = 1, p;
	if(t.weightFrom) {
		w = 1 * (a.getAttribute(t.weightFrom) || t.textHeight);
	} else if(document.defaultView && document.defaultView.getComputedStyle) {
		p = document.defaultView.getComputedStyle(a,null).getPropertyValue('font-size');
		w = p.replace('px','') * 1;
	} else {
		t.weight = false;
	}
	return w;
};
function MouseMove(e) {
	var i, tc, dd = document.documentElement;
	for(i in TagCanvas.tc) {
		tc = TagCanvas.tc[i];
		if(e.pageX) {
			tc.mx = e.pageX - tc.cx;
			tc.my = e.pageY - tc.cy;
		} else {
			tc.mx = e.clientX + (dd.scrollLeft || document.body.scrollLeft) - tc.cx;
			tc.my = e.clientY + (dd.scrollTop || document.body.scrollTop) - tc.cy;
		}
	}
};
function MouseClick(e) {
	var t = TagCanvas, cb = document.addEventListener ? 0 : 1,
		tg = e.target && e.target.id != undefined ? e.target.id : e.srcElement.parentNode.id;
	if(tg && e.button == cb && t.tc[tg]) {
		MouseMove(e);
		t.tc[tg].Clicked(e);
	}
};
function DrawCanvas() {
	var t = TagCanvas.tc, i;
	for(i in t)
		t[i].Draw();
};
/**
 * @constructor
 */
function Point(x,y) { this.x = x; this.y = y; }
function AbsPos(id) {
	var e, p, pn;
	e = document.getElementById(id);
	p = new Point(e.offsetLeft,e.offsetTop);
	while(e.offsetParent) {
		pn = e.offsetParent;
		p.x += pn.offsetLeft;
		p.y += pn.offsetTop;
		e = pn;
	}
	return p;
};
/**
 * @constructor
 */
function Point3D(x,y,z) { this.x = x; this.y = y; this.z = z; }
function RotX(p1,t) {
	var s = Math.sin(t), c = Math.cos(t); 
	return new Point3D(p1.x, (p1.y * c) + (p1.z * s), (p1.y * -s) + (p1.z * c));
};
function RotY(p1,t) {
	var s = Math.sin(t), c = Math.cos(t); 
	return new Point3D((p1.x * c) + (p1.z * -s), p1.y, (p1.x * s) + (p1.z * c));
};
function Project(tc,p1,w,h,fov,asp) {
	var yn, xn, zn, m = tc.z1 / (tc.z1 + tc.z2 + p1.z);
	yn = p1.y * m;
	xn = p1.x * m;
	zn = tc.z2 + p1.z;
	return new Point3D(xn, yn, zn);
};
/**
 * @constructor
 */
function Outline(tc) {
	this.ts = new Date().valueOf();
	this.tc = tc;
	this.x = this.y = this.w = this.h = this.sc = 1;
};
Outline.prototype.Update = function(x,y,w,h,sc) {
	var o = this.tc.outlineOffset;
	this.x = sc * (x - o);
	this.y = sc * (y - o);
	this.w = sc * (w + o * 2);
	this.h = sc * (h + o * 2);
	this.sc = sc; // used to determine frontmost
};
Outline.prototype.Draw = function(c) {
	var diff = new Date().valueOf() - this.ts, t = this.tc;
	c.setTransform(1,0,0,1,0,0);
	c.strokeStyle = t.outlineColour;
	c.lineWidth = t.outlineThickness;
	c.shadowBlur = c.shadowOffsetX = c.shadowOffsetY = 0;
	if(t.pulsateTo < 1.0)
		c.globalAlpha = t.pulsateTo + ((1.0 - t.pulsateTo) * 
			(0.5 + (Math.cos(2 * Math.PI * diff / (1000 * t.pulsateTime)) / 2.0)));
	else
		c.globalAlpha = 1.0;
	c.strokeRect(this.x, this.y, this.w, this.h);
};
Outline.prototype.Active = function(c,x,y) {
		return (x >= this.x && y >= this.y &&
			x <= this.x + this.w && y <= this.y + this.h);
};
/**
 * @constructor
 */
function Tag(tc,name,a,v,w,h) {
	var c = tc.ctxt;
	this.tc = tc;
	this.image = name.src ? name : null;
	this.name = name.src ? '' : name;
	this.a = a;
	this.p3d = new Point3D(0,0,0);
	this.p3d.x = v[0] * tc.radius * 1.1;
	this.p3d.y = v[1] * tc.radius * 1.1;
	this.p3d.z = v[2] * tc.radius * 1.1;
	this.x = this.y = 0;
	this.w = w;
	this.h = h;
	this.colour = tc.textColour;
	this.weight = this.sc = this.alpha = 1;
	this.weighted = !tc.weight;
	this.outline = new Outline(tc);
	if(!this.image) {
		this.textHeight = tc.textHeight;
		this.extents = FindTextBoundingBox(this.name, tc.textFont, this.textHeight);
		this.Measure(c,tc);
	}
	this.SetShadowColour = tc.shadowAlpha ? this.SetShadowColourAlpha : this.SetShadowColourFixed;
	this.Draw = this.image ? this.DrawImage : this.DrawText;
};
Tag.prototype.Measure = function(c,t) {
	this.h = this.extents ? this.extents.max.y + this.extents.min.y : this.textHeight;
	c.font = this.font = this.textHeight + 'px ' + t.textFont;
	this.w1 = c.measureText(this.name).width;
};
Tag.prototype.SetWeight = function(w) {
	this.weight = w;
	this.Weight(this.tc.ctxt, this.tc);
	this.Measure(this.tc.ctxt, this.tc);
};
Tag.prototype.Weight = function(c,t) {
	var w = this.weight, m = t.weightMode;
	this.weighted = true;
	if(m === 'colour' || m === 'both')
		this.colour = FindGradientColour(t, (w - t.min_weight) / (t.max_weight-t.min_weight));
	if(m === 'size' || m === 'both')
		this.textHeight = w * t.weightSize;
	this.extents = FindTextBoundingBox(this.name, t.textFont, this.textHeight);
};
Tag.prototype.SetShadowColourFixed = function(c,s,a) {
	c.shadowColor = s;
};
Tag.prototype.SetShadowColourAlpha = function(c,s,a) {
	c.shadowColor = SetAlpha(s, a);
};
Tag.prototype.DrawText = function(c,xoff,yoff) {
	var t = this.tc, x = this.x, y = this.y, w, h, s = this.sc, o = this.outline;

	c.globalAlpha = this.alpha;
	c.setTransform(s,0,0,s,0,0);
	c.fillStyle = this.colour;
	this.SetShadowColour(c,t.shadow,this.alpha);
	c.font = this.font;
	w = this.w1 * s;
	h = this.h * s;
	x += 1 + (xoff / s) - (w / 2.0);
	y += 1 + (yoff / s) - (h / 2.0);

	c.fillText(this.name, x, y);
	o.Update(x, y, this.w1, this.h, s);
	return o.Active(c, t.mx, t.my) ? o : null;
};
Tag.prototype.DrawImage = function(c,xoff,yoff) {
	var t = this.tc, x = this.x, y = this.y, w, h, s = this.sc, o = this.outline;
	c.globalAlpha = this.alpha;
	c.setTransform(s,0,0,s,0,0);
	c.fillStyle = this.colour;
	this.SetShadowColour(c,t.shadow,this.alpha);
	w = this.w * s;
	h = this.h * s;
	x += (xoff / s) - (w / 2.0);
	y += (yoff / s) - (h / 2.0);

	c.drawImage(this.image, x, y, w, h);
	o.Update(x, y, w, h, s);
	return o.Active(c, t.mx, t.my) ? o : null;
};
Tag.prototype.Calc = function(yaw,pitch) {
	var pp = RotY(this.p3d,yaw), t = this.tc, mb = t.minBrightness, r = t.radius;
	this.p3d = RotX(pp,pitch);
	pp = Project(t, this.p3d, this.w, this.h, Math.PI / 4, 20);
	this.x = pp.x;
	this.y = pp.y;
	this.sc = (t.z1 + t.z2 - pp.z) / t.z2;
	this.alpha = Math.max(mb,Math.min(1.0,mb + 1 - ((pp.z - t.z2 + r) / (2 * r))));
};
Tag.prototype.Clicked = function(e) {
	var a = this.a, t = a.target, h = a.href, evt;
	if(t != '' && t != '_self') {
		if(self.frames[t])
			self.frames[t] = h;
		else if(top.frames[t])
			top.frames[t] = h;
		else
			window.open(h, t);
		return;
	}
	if(a.fireEvent) {
		if(!a.fireEvent('onclick'))
			return;
	} else {
		evt = document.createEvent('MouseEvents');
		evt.initMouseEvent('click', true, true, window,
				0, 0, 0, 0, 0, false, false, false, false, 0, null);
		if(!a.dispatchEvent(evt))
			return;
	}
	document.location = h;
};
/**
 * @constructor
 */
function TagCanvas(cid,lctr,opt) {
	var i, ctr, tl, vl, p, im, ii, tag, c = document.getElementById(cid), cp = ['id','class','innerHTML'], w, weights = [];

	if(!c) throw 0;
	if(typeof(window.G_vmlCanvasManager) != 'undefined')
		c = window.G_vmlCanvasManager.initElement(c);
	if(c && (!c.getContext || !c.getContext('2d').fillText)) {
		p = document.createElement('DIV');
		for(i = 0; i < cp.length; ++i)
			p[cp[i]] = c[cp[i]];
		c.parentNode.insertBefore(p,c);
		c.parentNode.removeChild(c);
		throw 0;
	}
	for(i in TagCanvas.options)
		this[i] = opt && typeof(opt[i]) != 'undefined' ? opt[i] : 
			(typeof(TagCanvas[i]) != 'undefined' ? TagCanvas[i] : TagCanvas.options[i]);

	this.canvas = c;
	this.ctxt = c.getContext('2d');
	this.z1 = (19800 / (Math.exp(this.depth) * (1-1/Math.E))) +
		20000 - 19800 / (1-(1/Math.E));
	this.z2 = this.z1 * (1/this.zoom);
	this.radius = (c.height > c.width ? c.width : c.height)
				* 0.33 * (this.z2 + this.z1) / (this.z1);
	this.max_weight = 0;
	this.min_weight = 200;
	this.textFont = FixFont(this.textFont);
	// let the browser translate "red" into "#ff0000"
	this.ctxt.shadowColor = this.shadow;
	this.shadow = this.ctxt.shadowColor;
	this.shadowAlpha = (this.shadowBlur || this.shadowOffset[0] || this.shadowOffset[1]) && ShadowAlphaBroken();
	try {
		ctr = document.getElementById(lctr || cid);
		tl = ctr.getElementsByTagName('a');
		this.taglist = [];
		if(tl.length) {
			vl = PointsOnSphere(tl.length);
			for(i = 0; i < tl.length; ++i) {
				im = tl[i].getElementsByTagName('img');
				if(im.length) {
					ii = new Image;
					ii.src = im[0].src;
					tag = new Tag(this, ii, tl[i], vl[i], 1, 1);
					AddImage(ii,tag,this.taglist);
				} else {
					this.taglist.push(new Tag(this, tl[i].innerText || tl[i].textContent, tl[i],
						vl[i], 2, this.textHeight + 2));
				}
				if(this.weight) {
					w = FindWeight(this,tl[i]);
					if(w > this.max_weight) this.max_weight = w;
					if(w < this.min_weight) this.min_weight = w;
					weights.push(w);
				}
			}
			if(this.weight = (this.max_weight > this.min_weight)) {
				for(i = 0; i < this.taglist.length; ++i) {
					this.taglist[i].SetWeight(weights[i]);
				}
			}
		}
		if(lctr && this.hideTags)
			ctr.style.display = 'none';
	} catch(ex) {
		// ex;
	}

	this.yaw = this.initial ? this.initial[0] * this.maxSpeed : 0;
	this.pitch = this.initial ? this.initial[1] * this.maxSpeed : 0;
	p = AbsPos(c.id);
	this.cx = p.x;
	this.cy = p.y;
	if(!TagCanvas.started) {
		AddHandler('mousemove', MouseMove, null);
		AddHandler('mouseout', MouseMove, null);
		AddHandler('mouseup', MouseClick, null);
		TagCanvas.started = setInterval(DrawCanvas, this.interval);
	}
}
TagCanvas.prototype.Draw = function() {
	var cv = this.canvas, max_sc = 0, x1, y1, c, a, i, l = this.taglist.length;
	c = this.ctxt;
	c.setTransform(1,0,0,1,0,0);
	x1 = cv.width / 2;
	y1 = cv.height / 2;
	this.active = null;
	for(i = 0; i < l; ++i)
		this.taglist[i].Calc(this.yaw, this.pitch);
	this.taglist = this.taglist.sort(function(a,b) { return a.sc-b.sc;});
	c.textBaseline = 'top';
	if(this.shadowBlur || this.shadowOffset[0] || this.shadowOffset[1]) {
		c.shadowBlur = this.shadowBlur;
		c.shadowOffsetX = this.shadowOffset[0];
		c.shadowOffsetY = this.shadowOffset[1];
	}
	c.clearRect(0,0,cv.width,cv.height);
	for(i = 0; i < l; ++i)
	{
		a = this.taglist[i].Draw(c, x1, y1);
		if(a && a.sc > max_sc)
		{
			this.active = a;
			this.active.index = i;
			max_sc = a.sc;
		}
	}
	if(this.freezeActive && this.active)
		this.yaw = this.pitch = 0;
	else
		this.Animate(cv.width, cv.height);
	if(this.active)
		this.active.Draw(c);
};
TagCanvas.prototype.Animate = function(w,h) {
	var tc = this, x = tc.mx, y = tc.my, s, ay, ap, r;
	if(x >= 0 && y >= 0 && x < w && y < h)
	{
		s = tc.maxSpeed, r = tc.reverse ? -1 : 1;
		this.yaw = r * ((s * 2.0 * x / w) - s);
		this.pitch = r * -((s * 2.0 * y / h) - s);
		this.initial = null;
	}
	else if(!tc.initial)
	{
		s = tc.minSpeed, ay = Math.abs(tc.yaw), ap = Math.abs(tc.pitch);
		if(ay > s)
			this.yaw = ay > tc.z0 ? tc.yaw * tc.decel : 0.0;
		if(ap > s)
			this.pitch = ap > tc.z0 ? tc.pitch * tc.decel : 0.0;
	}
};
TagCanvas.prototype.Clicked = function(e) {
	var t = this.taglist, a = this.active;
	try {
		if(a && t[a.index]) 
			t[a.index].Clicked(e);
	} catch(ex) {
	}
};
TagCanvas.Start = function(id,l,o)
{
	TagCanvas.tc[id] = new TagCanvas(id,l,o);
};

TagCanvas.tc = {};
TagCanvas.options = {
z1: 20000,
z2: 20000,
z0: 0.0002,
freezeActive: false,
pulsateTo: 0.15,
pulsateTime: 3,
reverse: false,
depth: 0.5,
maxSpeed: 0.05,
minSpeed: 0.0,
decel: 0.95,
interval: 20,
minBrightness: 0.1,
outlineColour: '#ffff99',
outlineThickness: 2,
outlineOffset: 5,
textColour: '#ff99ff',
textHeight: 15,
textFont: 'Helvetica, Arial, sans-serif',
shadow: '#000',
shadowBlur: 0,
shadowOffset: [0,0],
initial: null,
hideTags: true,
zoom: 1.0,
weight: false,
weightMode: 'size',
weightFrom: null,
weightSize: 1.0,
weightGradient: {0:'#f00', 0.33:'#ff0', 0.66:'#0f0', 1:'#00f'}
};
for(i in TagCanvas.options) TagCanvas[i] = TagCanvas.options[i];
window.TagCanvas = TagCanvas;
})();
