/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 */

// namespace ?
var jsfeat = jsfeat || { REVISION: 'ALPHA' };
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 */

(function (global) {
    "use strict";
    //

    // CONSTANTS
    var EPSILON = 0.0000001192092896;
    var FLT_MIN = 1E-37;

    // implementation from CCV project
    // currently working only with u8,s32,f32
    var U8_t = 0x0100,
        S32_t = 0x0200,
        F32_t = 0x0400,
        S64_t = 0x0800,
        F64_t = 0x1000;

    var C1_t = 0x01,
        C2_t = 0x02,
        C3_t = 0x03,
        C4_t = 0x04;

    var _data_type_size = new Int32Array([-1, 1, 4, -1, 4, -1, -1, -1, 8, -1, -1, -1, -1, -1, -1, -1, 8]);

    var get_data_type = (function () {
        return function (type) {
            return (type & 0xFF00);
        }
    })();

    var get_channel = (function () {
        return function (type) {
            return (type & 0xFF);
        }
    })();

    var get_data_type_size = (function () {
        return function (type) {
            return _data_type_size[(type & 0xFF00) >> 8];
        }
    })();

    // color conversion
    var COLOR_RGBA2GRAY = 0;
    var COLOR_RGB2GRAY = 1;
    var COLOR_BGRA2GRAY = 2;
    var COLOR_BGR2GRAY = 3;

    // box blur option
    var BOX_BLUR_NOSCALE = 0x01;
    // svd options
    var SVD_U_T = 0x01;
    var SVD_V_T = 0x02;

    var data_t = (function () {
        function data_t(size_in_bytes, buffer) {
            // we need align size to multiple of 8
            this.size = ((size_in_bytes + 7) | 0) & -8;
            if (typeof buffer === "undefined") {
                this.buffer = new ArrayBuffer(this.size);
            } else {
                this.buffer = buffer;
                this.size = buffer.length;
            }
            this.u8 = new Uint8Array(this.buffer);
            this.i32 = new Int32Array(this.buffer);
            this.f32 = new Float32Array(this.buffer);
            this.f64 = new Float64Array(this.buffer);
        }
        return data_t;
    })();

    var matrix_t = (function () {
        // columns, rows, data_type
        function matrix_t(c, r, data_type, data_buffer) {
            this.type = get_data_type(data_type) | 0;
            this.channel = get_channel(data_type) | 0;
            this.cols = c | 0;
            this.rows = r | 0;
            if (typeof data_buffer === "undefined") {
                this.allocate();
            } else {
                this.buffer = data_buffer;
                // data user asked for
                this.data = this.type & U8_t ? this.buffer.u8 : (this.type & S32_t ? this.buffer.i32 : (this.type & F32_t ? this.buffer.f32 : this.buffer.f64));
            }
        }
        matrix_t.prototype.allocate = function () {
            // clear references
            delete this.data;
            delete this.buffer;
            //
            this.buffer = new data_t((this.cols * get_data_type_size(this.type) * this.channel) * this.rows);
            this.data = this.type & U8_t ? this.buffer.u8 : (this.type & S32_t ? this.buffer.i32 : (this.type & F32_t ? this.buffer.f32 : this.buffer.f64));
        }
        matrix_t.prototype.copy_to = function (other) {
            var od = other.data, td = this.data;
            var i = 0, n = (this.cols * this.rows * this.channel) | 0;
            for (; i < n - 4; i += 4) {
                od[i] = td[i];
                od[i + 1] = td[i + 1];
                od[i + 2] = td[i + 2];
                od[i + 3] = td[i + 3];
            }
            for (; i < n; ++i) {
                od[i] = td[i];
            }
        }
        matrix_t.prototype.resize = function (c, r, ch) {
            if (typeof ch === "undefined") { ch = this.channel; }
            // relocate buffer only if new size doesnt fit
            var new_size = (c * get_data_type_size(this.type) * ch) * r;
            if (new_size > this.buffer.size) {
                this.cols = c;
                this.rows = r;
                this.channel = ch;
                this.allocate();
            } else {
                this.cols = c;
                this.rows = r;
                this.channel = ch;
            }
        }

        return matrix_t;
    })();

    var pyramid_t = (function () {

        function pyramid_t(levels) {
            this.levels = levels | 0;
            this.data = new Array(levels);
            this.pyrdown = jsfeat.imgproc.pyrdown;
        }

        pyramid_t.prototype.allocate = function (start_w, start_h, data_type) {
            var i = this.levels;
            while (--i >= 0) {
                this.data[i] = new matrix_t(start_w >> i, start_h >> i, data_type);
            }
        }

        pyramid_t.prototype.build = function (input, skip_first_level) {
            if (typeof skip_first_level === "undefined") { skip_first_level = true; }
            // just copy data to first level
            var i = 2, a = input, b = this.data[0];
            if (!skip_first_level) {
                var j = input.cols * input.rows;
                while (--j >= 0) {
                    b.data[j] = input.data[j];
                }
            }
            b = this.data[1];
            this.pyrdown(a, b);
            for (; i < this.levels; ++i) {
                a = b;
                b = this.data[i];
                this.pyrdown(a, b);
            }
        }

        return pyramid_t;
    })();

    var keypoint_t = (function () {
        function keypoint_t(x, y, score, level, angle) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            if (typeof score === "undefined") { score = 0; }
            if (typeof level === "undefined") { level = 0; }
            if (typeof angle === "undefined") { angle = -1.0; }

            this.x = x;
            this.y = y;
            this.score = score;
            this.level = level;
            this.angle = angle;
        }
        return keypoint_t;
    })();


    // data types
    global.U8_t = U8_t;
    global.S32_t = S32_t;
    global.F32_t = F32_t;
    global.S64_t = S64_t;
    global.F64_t = F64_t;
    // data channels
    global.C1_t = C1_t;
    global.C2_t = C2_t;
    global.C3_t = C3_t;
    global.C4_t = C4_t;

    // popular formats
    global.U8C1_t = U8_t | C1_t;
    global.U8C3_t = U8_t | C3_t;
    global.U8C4_t = U8_t | C4_t;

    global.F32C1_t = F32_t | C1_t;
    global.F32C2_t = F32_t | C2_t;
    global.S32C1_t = S32_t | C1_t;
    global.S32C2_t = S32_t | C2_t;

    // constants
    global.EPSILON = EPSILON;
    global.FLT_MIN = FLT_MIN;

    // color convert
    global.COLOR_RGBA2GRAY = COLOR_RGBA2GRAY;
    global.COLOR_RGB2GRAY = COLOR_RGB2GRAY;
    global.COLOR_BGRA2GRAY = COLOR_BGRA2GRAY;
    global.COLOR_BGR2GRAY = COLOR_BGR2GRAY;

    // options
    global.BOX_BLUR_NOSCALE = BOX_BLUR_NOSCALE;
    global.SVD_U_T = SVD_U_T;
    global.SVD_V_T = SVD_V_T;

    global.get_data_type = get_data_type;
    global.get_channel = get_channel;
    global.get_data_type_size = get_data_type_size;

    global.data_t = data_t;
    global.matrix_t = matrix_t;
    global.pyramid_t = pyramid_t;
    global.keypoint_t = keypoint_t;

})(jsfeat);
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 */

(function (global) {
    "use strict";
    //

    var cache = (function () {

        // very primitive array cache, still need testing if it helps
        // of course V8 has its own powerful cache sys but i'm not sure
        // it caches several multichannel 640x480 buffer creations each frame

        var _pool_node_t = (function () {
            function _pool_node_t(size_in_bytes) {
                this.next = null;
                this.data = new jsfeat.data_t(size_in_bytes);
                this.size = this.data.size;
                this.buffer = this.data.buffer;
                this.u8 = this.data.u8;
                this.i32 = this.data.i32;
                this.f32 = this.data.f32;
                this.f64 = this.data.f64;
            }
            _pool_node_t.prototype.resize = function (size_in_bytes) {
                delete this.data;
                this.data = new jsfeat.data_t(size_in_bytes);
                this.size = this.data.size;
                this.buffer = this.data.buffer;
                this.u8 = this.data.u8;
                this.i32 = this.data.i32;
                this.f32 = this.data.f32;
                this.f64 = this.data.f64;
            }
            return _pool_node_t;
        })();

        var _pool_head, _pool_tail;
        var _pool_size = 0;

        return {

            allocate: function (capacity, data_size) {
                _pool_head = _pool_tail = new _pool_node_t(data_size);
                for (var i = 0; i < capacity; ++i) {
                    var node = new _pool_node_t(data_size);
                    _pool_tail = _pool_tail.next = node;

                    _pool_size++;
                }
            },

            get_buffer: function (size_in_bytes) {
                // assume we have enough free nodes
                var node = _pool_head;
                _pool_head = _pool_head.next;
                _pool_size--;

                if (size_in_bytes > node.size) {
                    node.resize(size_in_bytes);
                }

                return node;
            },

            put_buffer: function (node) {
                _pool_tail = _pool_tail.next = node;
                _pool_size++;
            }
        };
    })();

    global.cache = cache;
    // for now we dont need more than 30 buffers
    // if having cache sys really helps we can add auto extending sys
    cache.allocate(30, 640 * 4);

})(jsfeat);
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 */

(function (global) {
    "use strict";
    //

    var math = (function () {

        var qsort_stack = new Int32Array(48 * 2);

        return {
            get_gaussian_kernel: function (size, sigma, kernel, data_type) {
                var i = 0, x = 0.0, t = 0.0, sigma_x = 0.0, scale_2x = 0.0;
                var sum = 0.0;
                var kern_node = jsfeat.cache.get_buffer(size << 2);
                var _kernel = kern_node.f32;//new Float32Array(size);

                if ((size & 1) == 1 && size <= 7 && sigma <= 0) {
                    switch (size >> 1) {
                        case 0:
                            _kernel[0] = 1.0;
                            sum = 1.0;
                            break;
                        case 1:
                            _kernel[0] = 0.25, _kernel[1] = 0.5, _kernel[2] = 0.25;
                            sum = 0.25 + 0.5 + 0.25;
                            break;
                        case 2:
                            _kernel[0] = 0.0625, _kernel[1] = 0.25, _kernel[2] = 0.375,
                            _kernel[3] = 0.25, _kernel[4] = 0.0625;
                            sum = 0.0625 + 0.25 + 0.375 + 0.25 + 0.0625;
                            break;
                        case 3:
                            _kernel[0] = 0.03125, _kernel[1] = 0.109375, _kernel[2] = 0.21875,
                            _kernel[3] = 0.28125, _kernel[4] = 0.21875, _kernel[5] = 0.109375, _kernel[6] = 0.03125;
                            sum = 0.03125 + 0.109375 + 0.21875 + 0.28125 + 0.21875 + 0.109375 + 0.03125;
                            break;
                    }
                } else {
                    sigma_x = sigma > 0 ? sigma : ((size - 1) * 0.5 - 1.0) * 0.3 + 0.8;
                    scale_2x = -0.5 / (sigma_x * sigma_x);

                    for (; i < size; ++i) {
                        x = i - (size - 1) * 0.5;
                        t = Math.exp(scale_2x * x * x);

                        _kernel[i] = t;
                        sum += t;
                    }
                }

                if (data_type & jsfeat.U8_t) {
                    // int based kernel
                    sum = 256.0 / sum;
                    for (i = 0; i < size; ++i) {
                        kernel[i] = (_kernel[i] * sum + 0.5) | 0;
                    }
                } else {
                    // classic kernel
                    sum = 1.0 / sum;
                    for (i = 0; i < size; ++i) {
                        kernel[i] = _kernel[i] * sum;
                    }
                }

                jsfeat.cache.put_buffer(kern_node);
            },

            // model is 3x3 matrix_t
            perspective_4point_transform: function (model, src_x0, src_y0, dst_x0, dst_y0,
                                                        src_x1, src_y1, dst_x1, dst_y1,
                                                        src_x2, src_y2, dst_x2, dst_y2,
                                                        src_x3, src_y3, dst_x3, dst_y3) {
                var t1 = src_x0;
                var t2 = src_x2;
                var t4 = src_y1;
                var t5 = t1 * t2 * t4;
                var t6 = src_y3;
                var t7 = t1 * t6;
                var t8 = t2 * t7;
                var t9 = src_y2;
                var t10 = t1 * t9;
                var t11 = src_x1;
                var t14 = src_y0;
                var t15 = src_x3;
                var t16 = t14 * t15;
                var t18 = t16 * t11;
                var t20 = t15 * t11 * t9;
                var t21 = t15 * t4;
                var t24 = t15 * t9;
                var t25 = t2 * t4;
                var t26 = t6 * t2;
                var t27 = t6 * t11;
                var t28 = t9 * t11;
                var t30 = 1.0 / (t21 - t24 - t25 + t26 - t27 + t28);
                var t32 = t1 * t15;
                var t35 = t14 * t11;
                var t41 = t4 * t1;
                var t42 = t6 * t41;
                var t43 = t14 * t2;
                var t46 = t16 * t9;
                var t48 = t14 * t9 * t11;
                var t51 = t4 * t6 * t2;
                var t55 = t6 * t14;
                var Hr0 = -(t8 - t5 + t10 * t11 - t11 * t7 - t16 * t2 + t18 - t20 + t21 * t2) * t30;
                var Hr1 = (t5 - t8 - t32 * t4 + t32 * t9 + t18 - t2 * t35 + t27 * t2 - t20) * t30;
                var Hr2 = t1;
                var Hr3 = (-t9 * t7 + t42 + t43 * t4 - t16 * t4 + t46 - t48 + t27 * t9 - t51) * t30;
                var Hr4 = (-t42 + t41 * t9 - t55 * t2 + t46 - t48 + t55 * t11 + t51 - t21 * t9) * t30;
                var Hr5 = t14;
                var Hr6 = (-t10 + t41 + t43 - t35 + t24 - t21 - t26 + t27) * t30;
                var Hr7 = (-t7 + t10 + t16 - t43 + t27 - t28 - t21 + t25) * t30;

                t1 = dst_x0;
                t2 = dst_x2;
                t4 = dst_y1;
                t5 = t1 * t2 * t4;
                t6 = dst_y3;
                t7 = t1 * t6;
                t8 = t2 * t7;
                t9 = dst_y2;
                t10 = t1 * t9;
                t11 = dst_x1;
                t14 = dst_y0;
                t15 = dst_x3;
                t16 = t14 * t15;
                t18 = t16 * t11;
                t20 = t15 * t11 * t9;
                t21 = t15 * t4;
                t24 = t15 * t9;
                t25 = t2 * t4;
                t26 = t6 * t2;
                t27 = t6 * t11;
                t28 = t9 * t11;
                t30 = 1.0 / (t21 - t24 - t25 + t26 - t27 + t28);
                t32 = t1 * t15;
                t35 = t14 * t11;
                t41 = t4 * t1;
                t42 = t6 * t41;
                t43 = t14 * t2;
                t46 = t16 * t9;
                t48 = t14 * t9 * t11;
                t51 = t4 * t6 * t2;
                t55 = t6 * t14;
                var Hl0 = -(t8 - t5 + t10 * t11 - t11 * t7 - t16 * t2 + t18 - t20 + t21 * t2) * t30;
                var Hl1 = (t5 - t8 - t32 * t4 + t32 * t9 + t18 - t2 * t35 + t27 * t2 - t20) * t30;
                var Hl2 = t1;
                var Hl3 = (-t9 * t7 + t42 + t43 * t4 - t16 * t4 + t46 - t48 + t27 * t9 - t51) * t30;
                var Hl4 = (-t42 + t41 * t9 - t55 * t2 + t46 - t48 + t55 * t11 + t51 - t21 * t9) * t30;
                var Hl5 = t14;
                var Hl6 = (-t10 + t41 + t43 - t35 + t24 - t21 - t26 + t27) * t30;
                var Hl7 = (-t7 + t10 + t16 - t43 + t27 - t28 - t21 + t25) * t30;

                // the following code computes R = Hl * inverse Hr
                t2 = Hr4 - Hr7 * Hr5;
                t4 = Hr0 * Hr4;
                t5 = Hr0 * Hr5;
                t7 = Hr3 * Hr1;
                t8 = Hr2 * Hr3;
                t10 = Hr1 * Hr6;
                var t12 = Hr2 * Hr6;
                t15 = 1.0 / (t4 - t5 * Hr7 - t7 + t8 * Hr7 + t10 * Hr5 - t12 * Hr4);
                t18 = -Hr3 + Hr5 * Hr6;
                var t23 = -Hr3 * Hr7 + Hr4 * Hr6;
                t28 = -Hr1 + Hr2 * Hr7;
                var t31 = Hr0 - t12;
                t35 = Hr0 * Hr7 - t10;
                t41 = -Hr1 * Hr5 + Hr2 * Hr4;
                var t44 = t5 - t8;
                var t47 = t4 - t7;
                t48 = t2 * t15;
                var t49 = t28 * t15;
                var t50 = t41 * t15;
                var mat = model.data;
                mat[0] = Hl0 * t48 + Hl1 * (t18 * t15) - Hl2 * (t23 * t15);
                mat[1] = Hl0 * t49 + Hl1 * (t31 * t15) - Hl2 * (t35 * t15);
                mat[2] = -Hl0 * t50 - Hl1 * (t44 * t15) + Hl2 * (t47 * t15);
                mat[3] = Hl3 * t48 + Hl4 * (t18 * t15) - Hl5 * (t23 * t15);
                mat[4] = Hl3 * t49 + Hl4 * (t31 * t15) - Hl5 * (t35 * t15);
                mat[5] = -Hl3 * t50 - Hl4 * (t44 * t15) + Hl5 * (t47 * t15);
                mat[6] = Hl6 * t48 + Hl7 * (t18 * t15) - t23 * t15;
                mat[7] = Hl6 * t49 + Hl7 * (t31 * t15) - t35 * t15;
                mat[8] = -Hl6 * t50 - Hl7 * (t44 * t15) + t47 * t15;
            },

            // The current implementation was derived from *BSD system qsort():
            // Copyright (c) 1992, 1993
            // The Regents of the University of California.  All rights reserved.
            qsort: function (array, low, high, cmp) {
                var isort_thresh = 7;
                var t, ta, tb, tc;
                var sp = 0, left = 0, right = 0, i = 0, n = 0, m = 0, ptr = 0, ptr2 = 0, d = 0;
                var left0 = 0, left1 = 0, right0 = 0, right1 = 0, pivot = 0, a = 0, b = 0, c = 0, swap_cnt = 0;

                var stack = qsort_stack;

                if ((high - low + 1) <= 1) return;

                stack[0] = low;
                stack[1] = high;

                while (sp >= 0) {

                    left = stack[sp << 1];
                    right = stack[(sp << 1) + 1];
                    sp--;

                    for (; ;) {
                        n = (right - left) + 1;

                        if (n <= isort_thresh) {
                            //insert_sort:
                            for (ptr = left + 1; ptr <= right; ptr++) {
                                for (ptr2 = ptr; ptr2 > left && cmp(array[ptr2], array[ptr2 - 1]) ; ptr2--) {
                                    t = array[ptr2];
                                    array[ptr2] = array[ptr2 - 1];
                                    array[ptr2 - 1] = t;
                                }
                            }
                            break;
                        } else {
                            swap_cnt = 0;

                            left0 = left;
                            right0 = right;
                            pivot = left + (n >> 1);

                            if (n > 40) {
                                d = n >> 3;
                                a = left, b = left + d, c = left + (d << 1);
                                ta = array[a], tb = array[b], tc = array[c];
                                left = cmp(ta, tb) ? (cmp(tb, tc) ? b : (cmp(ta, tc) ? c : a))
                                                  : (cmp(tc, tb) ? b : (cmp(ta, tc) ? a : c));

                                a = pivot - d, b = pivot, c = pivot + d;
                                ta = array[a], tb = array[b], tc = array[c];
                                pivot = cmp(ta, tb) ? (cmp(tb, tc) ? b : (cmp(ta, tc) ? c : a))
                                                  : (cmp(tc, tb) ? b : (cmp(ta, tc) ? a : c));

                                a = right - (d << 1), b = right - d, c = right;
                                ta = array[a], tb = array[b], tc = array[c];
                                right = cmp(ta, tb) ? (cmp(tb, tc) ? b : (cmp(ta, tc) ? c : a))
                                                  : (cmp(tc, tb) ? b : (cmp(ta, tc) ? a : c));
                            }

                            a = left, b = pivot, c = right;
                            ta = array[a], tb = array[b], tc = array[c];
                            pivot = cmp(ta, tb) ? (cmp(tb, tc) ? b : (cmp(ta, tc) ? c : a))
                                               : (cmp(tc, tb) ? b : (cmp(ta, tc) ? a : c));
                            if (pivot != left0) {
                                t = array[pivot];
                                array[pivot] = array[left0];
                                array[left0] = t;
                                pivot = left0;
                            }
                            left = left1 = left0 + 1;
                            right = right1 = right0;

                            ta = array[pivot];
                            for (; ;) {
                                while (left <= right && !cmp(ta, array[left])) {
                                    if (!cmp(array[left], ta)) {
                                        if (left > left1) {
                                            t = array[left1];
                                            array[left1] = array[left];
                                            array[left] = t;
                                        }
                                        swap_cnt = 1;
                                        left1++;
                                    }
                                    left++;
                                }

                                while (left <= right && !cmp(array[right], ta)) {
                                    if (!cmp(ta, array[right])) {
                                        if (right < right1) {
                                            t = array[right1];
                                            array[right1] = array[right];
                                            array[right] = t;
                                        }
                                        swap_cnt = 1;
                                        right1--;
                                    }
                                    right--;
                                }

                                if (left > right) break;

                                t = array[left];
                                array[left] = array[right];
                                array[right] = t;
                                swap_cnt = 1;
                                left++;
                                right--;
                            }

                            if (swap_cnt == 0) {
                                left = left0, right = right0;
                                //goto insert_sort;
                                for (ptr = left + 1; ptr <= right; ptr++) {
                                    for (ptr2 = ptr; ptr2 > left && cmp(array[ptr2], array[ptr2 - 1]) ; ptr2--) {
                                        t = array[ptr2];
                                        array[ptr2] = array[ptr2 - 1];
                                        array[ptr2 - 1] = t;
                                    }
                                }
                                break;
                            }

                            n = Math.min((left1 - left0), (left - left1));
                            m = (left - n) | 0;
                            for (i = 0; i < n; ++i, ++m) {
                                t = array[left0 + i];
                                array[left0 + i] = array[m];
                                array[m] = t;
                            }

                            n = Math.min((right0 - right1), (right1 - right));
                            m = (right0 - n + 1) | 0;
                            for (i = 0; i < n; ++i, ++m) {
                                t = array[left + i];
                                array[left + i] = array[m];
                                array[m] = t;
                            }
                            n = (left - left1);
                            m = (right1 - right);
                            if (n > 1) {
                                if (m > 1) {
                                    if (n > m) {
                                        ++sp;
                                        stack[sp << 1] = left0;
                                        stack[(sp << 1) + 1] = left0 + n - 1;
                                        left = right0 - m + 1, right = right0;
                                    } else {
                                        ++sp;
                                        stack[sp << 1] = right0 - m + 1;
                                        stack[(sp << 1) + 1] = right0;
                                        left = left0, right = left0 + n - 1;
                                    }
                                } else {
                                    left = left0, right = left0 + n - 1;
                                }
                            }
                            else if (m > 1)
                                left = right0 - m + 1, right = right0;
                            else
                                break;
                        }
                    }
                }
            },

            median: function (array, low, high) {
                var w;
                var middle = 0, ll = 0, hh = 0, median = (low + high) >> 1;
                for (; ;) {
                    if (high <= low) return array[median];
                    if (high == (low + 1)) {
                        if (array[low] > array[high]) {
                            w = array[low];
                            array[low] = array[high];
                            array[high] = w;
                        }
                        return array[median];
                    }
                    middle = ((low + high) >> 1);
                    if (array[middle] > array[high]) {
                        w = array[middle];
                        array[middle] = array[high];
                        array[high] = w;
                    }
                    if (array[low] > array[high]) {
                        w = array[low];
                        array[low] = array[high];
                        array[high] = w;
                    }
                    if (array[middle] > array[low]) {
                        w = array[middle];
                        array[middle] = array[low];
                        array[low] = w;
                    }
                    ll = (low + 1);
                    w = array[middle];
                    array[middle] = array[ll];
                    array[ll] = w;
                    hh = high;
                    for (; ;) {
                        do ++ll; while (array[low] > array[ll]);
                        do --hh; while (array[hh] > array[low]);
                        if (hh < ll) break;
                        w = array[ll];
                        array[ll] = array[hh];
                        array[hh] = w;
                    }
                    w = array[low];
                    array[low] = array[hh];
                    array[hh] = w;
                    if (hh <= median)
                        low = ll;
                    else if (hh >= median)
                        high = (hh - 1);
                }
                return 0;
            }
        };

    })();

    global.math = math;

})(jsfeat);
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 *
 */

(function (global) {
    "use strict";
    //

    var matmath = (function () {

        return {
            identity: function (M, value) {
                if (typeof value === "undefined") { value = 1; }
                var src = M.data;
                var rows = M.rows, cols = M.cols, cols_1 = (cols + 1) | 0;
                var len = rows * cols;
                var k = len;
                while (--len >= 0) src[len] = 0.0;
                len = k;
                k = 0;
                while (k < len) {
                    src[k] = value;
                    k = k + cols_1;
                }
            },

            transpose: function (At, A) {
                var i = 0, j = 0, nrows = A.rows, ncols = A.cols;
                var Ai = 0, Ati = 0, pAt = 0;
                var ad = A.data, atd = At.data;

                for (; i < nrows; Ati += 1, Ai += ncols, i++) {
                    pAt = Ati;
                    for (j = 0; j < ncols; pAt += nrows, j++) atd[pAt] = ad[Ai + j];
                }
            },

            // C = A * B
            multiply: function (C, A, B) {
                var i = 0, j = 0, k = 0;
                var Ap = 0, pA = 0, pB = 0, p_B = 0, Cp = 0;
                var ncols = A.cols, nrows = A.rows, mcols = B.cols;
                var ad = A.data, bd = B.data, cd = C.data;
                var sum = 0.0;

                for (; i < nrows; Ap += ncols, i++) {
                    for (p_B = 0, j = 0; j < mcols; Cp++, p_B++, j++) {
                        pB = p_B;
                        pA = Ap;
                        sum = 0.0;
                        for (k = 0; k < ncols; pA++, pB += mcols, k++) {
                            sum += ad[pA] * bd[pB];
                        }
                        cd[Cp] = sum;
                    }
                }
            },

            // C = A * B'
            multiply_ABt: function (C, A, B) {
                var i = 0, j = 0, k = 0;
                var Ap = 0, pA = 0, pB = 0, Cp = 0;
                var ncols = A.cols, nrows = A.rows, mrows = B.rows;
                var ad = A.data, bd = B.data, cd = C.data;
                var sum = 0.0;

                for (; i < nrows; Ap += ncols, i++) {
                    for (pB = 0, j = 0; j < mrows; Cp++, j++) {
                        pA = Ap;
                        sum = 0.0;
                        for (k = 0; k < ncols; pA++, pB++, k++) {
                            sum += ad[pA] * bd[pB];
                        }
                        cd[Cp] = sum;
                    }
                }
            },

            // C = A' * B
            multiply_AtB: function (C, A, B) {
                var i = 0, j = 0, k = 0;
                var Ap = 0, pA = 0, pB = 0, p_B = 0, Cp = 0;
                var ncols = A.cols, nrows = A.rows, mcols = B.cols;
                var ad = A.data, bd = B.data, cd = C.data;
                var sum = 0.0;

                for (; i < ncols; Ap++, i++) {
                    for (p_B = 0, j = 0; j < mcols; Cp++, p_B++, j++) {
                        pB = p_B;
                        pA = Ap;
                        sum = 0.0;
                        for (k = 0; k < nrows; pA += ncols, pB += mcols, k++) {
                            sum += ad[pA] * bd[pB];
                        }
                        cd[Cp] = sum;
                    }
                }
            },

            // C = A * A'
            multiply_AAt: function (C, A) {
                var i = 0, j = 0, k = 0;
                var pCdiag = 0, p_A = 0, pA = 0, pB = 0, pC = 0, pCt = 0;
                var ncols = A.cols, nrows = A.rows;
                var ad = A.data, cd = C.data;
                var sum = 0.0;

                for (; i < nrows; pCdiag += nrows + 1, p_A = pA, i++) {
                    pC = pCdiag;
                    pCt = pCdiag;
                    pB = p_A;
                    for (j = i; j < nrows; pC++, pCt += nrows, j++) {
                        pA = p_A;
                        sum = 0.0;
                        for (k = 0; k < ncols; k++) {
                            sum += ad[pA++] * ad[pB++];
                        }
                        cd[pC] = sum
                        cd[pCt] = sum;
                    }
                }
            },

            // C = A' * A
            multiply_AtA: function (C, A) {
                var i = 0, j = 0, k = 0;
                var p_A = 0, pA = 0, pB = 0, p_C = 0, pC = 0, p_CC = 0;
                var ncols = A.cols, nrows = A.rows;
                var ad = A.data, cd = C.data;
                var sum = 0.0;

                for (; i < ncols; p_C += ncols, i++) {
                    p_A = i;
                    p_CC = p_C + i;
                    pC = p_CC;
                    for (j = i; j < ncols; pC++, p_CC += ncols, j++) {
                        pA = p_A;
                        pB = j;
                        sum = 0.0;
                        for (k = 0; k < nrows; pA += ncols, pB += ncols, k++) {
                            sum += ad[pA] * ad[pB];
                        }
                        cd[pC] = sum
                        cd[p_CC] = sum;
                    }
                }
            },

            // various small matrix operations
            identity_3x3: function (M, value) {
                if (typeof value === "undefined") { value = 1; }
                var dt = M.data;
                dt[0] = dt[4] = dt[8] = value;
                dt[1] = dt[2] = dt[3] = 0;
                dt[5] = dt[6] = dt[7] = 0;
            },

            invert_3x3: function (from, to) {
                var A = from.data, invA = to.data;
                var t1 = A[4];
                var t2 = A[8];
                var t4 = A[5];
                var t5 = A[7];
                var t8 = A[0];

                var t9 = t8 * t1;
                var t11 = t8 * t4;
                var t13 = A[3];
                var t14 = A[1];
                var t15 = t13 * t14;
                var t17 = A[2];
                var t18 = t13 * t17;
                var t20 = A[6];
                var t21 = t20 * t14;
                var t23 = t20 * t17;
                var t26 = 1.0 / (t9 * t2 - t11 * t5 - t15 * t2 + t18 * t5 + t21 * t4 - t23 * t1);
                invA[0] = (t1 * t2 - t4 * t5) * t26;
                invA[1] = -(t14 * t2 - t17 * t5) * t26;
                invA[2] = -(-t14 * t4 + t17 * t1) * t26;
                invA[3] = -(t13 * t2 - t4 * t20) * t26;
                invA[4] = (t8 * t2 - t23) * t26;
                invA[5] = -(t11 - t18) * t26;
                invA[6] = -(-t13 * t5 + t1 * t20) * t26;
                invA[7] = -(t8 * t5 - t21) * t26;
                invA[8] = (t9 - t15) * t26;
            },
            // C = A * B
            multiply_3x3: function (C, A, B) {
                var Cd = C.data, Ad = A.data, Bd = B.data;
                var m1_0 = Ad[0], m1_1 = Ad[1], m1_2 = Ad[2];
                var m1_3 = Ad[3], m1_4 = Ad[4], m1_5 = Ad[5];
                var m1_6 = Ad[6], m1_7 = Ad[7], m1_8 = Ad[8];

                var m2_0 = Bd[0], m2_1 = Bd[1], m2_2 = Bd[2];
                var m2_3 = Bd[3], m2_4 = Bd[4], m2_5 = Bd[5];
                var m2_6 = Bd[6], m2_7 = Bd[7], m2_8 = Bd[8];

                Cd[0] = m1_0 * m2_0 + m1_1 * m2_3 + m1_2 * m2_6;
                Cd[1] = m1_0 * m2_1 + m1_1 * m2_4 + m1_2 * m2_7;
                Cd[2] = m1_0 * m2_2 + m1_1 * m2_5 + m1_2 * m2_8;
                Cd[3] = m1_3 * m2_0 + m1_4 * m2_3 + m1_5 * m2_6;
                Cd[4] = m1_3 * m2_1 + m1_4 * m2_4 + m1_5 * m2_7;
                Cd[5] = m1_3 * m2_2 + m1_4 * m2_5 + m1_5 * m2_8;
                Cd[6] = m1_6 * m2_0 + m1_7 * m2_3 + m1_8 * m2_6;
                Cd[7] = m1_6 * m2_1 + m1_7 * m2_4 + m1_8 * m2_7;
                Cd[8] = m1_6 * m2_2 + m1_7 * m2_5 + m1_8 * m2_8;
            },

            mat3x3_determinant: function (M) {
                var md = M.data;
                return md[0] * md[4] * md[8] -
                        md[0] * md[5] * md[7] -
                        md[3] * md[1] * md[8] +
                        md[3] * md[2] * md[7] +
                        md[6] * md[1] * md[5] -
                        md[6] * md[2] * md[4];
            },

            determinant_3x3: function (M11, M12, M13,
                                      M21, M22, M23,
                                      M31, M32, M33) {
                return M11 * M22 * M33 - M11 * M23 * M32 -
                          M21 * M12 * M33 + M21 * M13 * M32 +
                          M31 * M12 * M23 - M31 * M13 * M22;
            }
        };

    })();

    global.matmath = matmath;

})(jsfeat);
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 *
 */

(function (global) {
    "use strict";
    //

    var linalg = (function () {

        var swap = function (A, i0, i1, t) {
            t = A[i0];
            A[i0] = A[i1];
            A[i1] = t;
        }

        var hypot = function (a, b) {
            a = Math.abs(a);
            b = Math.abs(b);
            if (a > b) {
                b /= a;
                return a * Math.sqrt(1.0 + b * b);
            }
            if (b > 0) {
                a /= b;
                return b * Math.sqrt(1.0 + a * a);
            }
            return 0.0;
        }

        var JacobiImpl = function (A, astep, W, V, vstep, n) {
            var eps = jsfeat.EPSILON;
            var i = 0, j = 0, k = 0, m = 0, l = 0, idx = 0, _in = 0, _in2 = 0;
            var iters = 0, max_iter = n * n * 30;
            var mv = 0.0, val = 0.0, p = 0.0, y = 0.0, t = 0.0, s = 0.0, c = 0.0, a0 = 0.0, b0 = 0.0;

            var indR_buff = jsfeat.cache.get_buffer(n << 2);
            var indC_buff = jsfeat.cache.get_buffer(n << 2);
            var indR = indR_buff.i32;
            var indC = indC_buff.i32;

            if (V) {
                for (; i < n; i++) {
                    k = i * vstep;
                    for (j = 0; j < n; j++) {
                        V[k + j] = 0.0;
                    }
                    V[k + i] = 1.0;
                }
            }

            for (k = 0; k < n; k++) {
                W[k] = A[(astep + 1) * k];
                if (k < n - 1) {
                    for (m = k + 1, mv = Math.abs(A[astep * k + m]), i = k + 2; i < n; i++) {
                        val = Math.abs(A[astep * k + i]);
                        if (mv < val)
                            mv = val, m = i;
                    }
                    indR[k] = m;
                }
                if (k > 0) {
                    for (m = 0, mv = Math.abs(A[k]), i = 1; i < k; i++) {
                        val = Math.abs(A[astep * i + k]);
                        if (mv < val)
                            mv = val, m = i;
                    }
                    indC[k] = m;
                }
            }

            if (n > 1) for (; iters < max_iter; iters++) {
                // find index (k,l) of pivot p
                for (k = 0, mv = Math.abs(A[indR[0]]), i = 1; i < n - 1; i++) {
                    val = Math.abs(A[astep * i + indR[i]]);
                    if (mv < val)
                        mv = val, k = i;
                }
                l = indR[k];
                for (i = 1; i < n; i++) {
                    val = Math.abs(A[astep * indC[i] + i]);
                    if (mv < val)
                        mv = val, k = indC[i], l = i;
                }

                p = A[astep * k + l];

                if (Math.abs(p) <= eps) break;

                y = (W[l] - W[k]) * 0.5;
                t = Math.abs(y) + hypot(p, y);
                s = hypot(p, t);
                c = t / s;
                s = p / s; t = (p / t) * p;
                if (y < 0)
                    s = -s, t = -t;
                A[astep * k + l] = 0;

                W[k] -= t;
                W[l] += t;

                // rotate rows and columns k and l
                for (i = 0; i < k; i++) {
                    _in = (astep * i + k);
                    _in2 = (astep * i + l);
                    a0 = A[_in];
                    b0 = A[_in2];
                    A[_in] = a0 * c - b0 * s;
                    A[_in2] = a0 * s + b0 * c;
                }
                for (i = (k + 1) ; i < l; i++) {
                    _in = (astep * k + i);
                    _in2 = (astep * i + l);
                    a0 = A[_in];
                    b0 = A[_in2];
                    A[_in] = a0 * c - b0 * s;
                    A[_in2] = a0 * s + b0 * c;
                }
                i = l + 1;
                _in = (astep * k + i);
                _in2 = (astep * l + i);
                for (; i < n; i++, _in++, _in2++) {
                    a0 = A[_in];
                    b0 = A[_in2];
                    A[_in] = a0 * c - b0 * s;
                    A[_in2] = a0 * s + b0 * c;
                }

                // rotate eigenvectors
                if (V) {
                    _in = vstep * k;
                    _in2 = vstep * l;
                    for (i = 0; i < n; i++, _in++, _in2++) {
                        a0 = V[_in];
                        b0 = V[_in2];
                        V[_in] = a0 * c - b0 * s;
                        V[_in2] = a0 * s + b0 * c;
                    }
                }

                for (j = 0; j < 2; j++) {
                    idx = j == 0 ? k : l;
                    if (idx < n - 1) {
                        for (m = idx + 1, mv = Math.abs(A[astep * idx + m]), i = idx + 2; i < n; i++) {
                            val = Math.abs(A[astep * idx + i]);
                            if (mv < val)
                                mv = val, m = i;
                        }
                        indR[idx] = m;
                    }
                    if (idx > 0) {
                        for (m = 0, mv = Math.abs(A[idx]), i = 1; i < idx; i++) {
                            val = Math.abs(A[astep * i + idx]);
                            if (mv < val)
                                mv = val, m = i;
                        }
                        indC[idx] = m;
                    }
                }
            }

            // sort eigenvalues & eigenvectors
            for (k = 0; k < n - 1; k++) {
                m = k;
                for (i = k + 1; i < n; i++) {
                    if (W[m] < W[i])
                        m = i;
                }
                if (k != m) {
                    swap(W, m, k, mv);
                    if (V) {
                        for (i = 0; i < n; i++) {
                            swap(V, vstep * m + i, vstep * k + i, mv);
                        }
                    }
                }
            }


            jsfeat.cache.put_buffer(indR_buff);
            jsfeat.cache.put_buffer(indC_buff);
        }

        var JacobiSVDImpl = function (At, astep, _W, Vt, vstep, m, n, n1) {
            var eps = jsfeat.EPSILON * 2.0;
            var minval = jsfeat.FLT_MIN;
            var i = 0, j = 0, k = 0, iter = 0, max_iter = Math.max(m, 30);
            var Ai = 0, Aj = 0, Vi = 0, Vj = 0, changed = 0;
            var c = 0.0, s = 0.0, t = 0.0;
            var t0 = 0.0, t1 = 0.0, sd = 0.0, beta = 0.0, gamma = 0.0, delta = 0.0, a = 0.0, p = 0.0, b = 0.0;
            var seed = 0x1234;
            var val = 0.0, val0 = 0.0, asum = 0.0;

            var W_buff = jsfeat.cache.get_buffer(n << 3);
            var W = W_buff.f64;

            for (; i < n; i++) {
                for (k = 0, sd = 0; k < m; k++) {
                    t = At[i * astep + k];
                    sd += t * t;
                }
                W[i] = sd;

                if (Vt) {
                    for (k = 0; k < n; k++) {
                        Vt[i * vstep + k] = 0;
                    }
                    Vt[i * vstep + i] = 1;
                }
            }

            for (; iter < max_iter; iter++) {
                changed = 0;

                for (i = 0; i < n - 1; i++) {
                    for (j = i + 1; j < n; j++) {
                        Ai = (i * astep) | 0, Aj = (j * astep) | 0;
                        a = W[i], p = 0, b = W[j];

                        k = 2;
                        p += At[Ai] * At[Aj];
                        p += At[Ai + 1] * At[Aj + 1];

                        for (; k < m; k++)
                            p += At[Ai + k] * At[Aj + k];

                        if (Math.abs(p) <= eps * Math.sqrt(a * b)) continue;

                        p *= 2.0;
                        beta = a - b, gamma = hypot(p, beta);
                        if (beta < 0) {
                            delta = (gamma - beta) * 0.5;
                            s = Math.sqrt(delta / gamma);
                            c = (p / (gamma * s * 2.0));
                        } else {
                            c = Math.sqrt((gamma + beta) / (gamma * 2.0));
                            s = (p / (gamma * c * 2.0));
                        }

                        a = 0.0, b = 0.0;

                        k = 2; // unroll
                        t0 = c * At[Ai] + s * At[Aj];
                        t1 = -s * At[Ai] + c * At[Aj];
                        At[Ai] = t0; At[Aj] = t1;
                        a += t0 * t0; b += t1 * t1;

                        t0 = c * At[Ai + 1] + s * At[Aj + 1];
                        t1 = -s * At[Ai + 1] + c * At[Aj + 1];
                        At[Ai + 1] = t0; At[Aj + 1] = t1;
                        a += t0 * t0; b += t1 * t1;

                        for (; k < m; k++) {
                            t0 = c * At[Ai + k] + s * At[Aj + k];
                            t1 = -s * At[Ai + k] + c * At[Aj + k];
                            At[Ai + k] = t0; At[Aj + k] = t1;

                            a += t0 * t0; b += t1 * t1;
                        }

                        W[i] = a; W[j] = b;

                        changed = 1;

                        if (Vt) {
                            Vi = (i * vstep) | 0, Vj = (j * vstep) | 0;

                            k = 2;
                            t0 = c * Vt[Vi] + s * Vt[Vj];
                            t1 = -s * Vt[Vi] + c * Vt[Vj];
                            Vt[Vi] = t0; Vt[Vj] = t1;

                            t0 = c * Vt[Vi + 1] + s * Vt[Vj + 1];
                            t1 = -s * Vt[Vi + 1] + c * Vt[Vj + 1];
                            Vt[Vi + 1] = t0; Vt[Vj + 1] = t1;

                            for (; k < n; k++) {
                                t0 = c * Vt[Vi + k] + s * Vt[Vj + k];
                                t1 = -s * Vt[Vi + k] + c * Vt[Vj + k];
                                Vt[Vi + k] = t0; Vt[Vj + k] = t1;
                            }
                        }
                    }
                }
                if (changed == 0) break;
            }

            for (i = 0; i < n; i++) {
                for (k = 0, sd = 0; k < m; k++) {
                    t = At[i * astep + k];
                    sd += t * t;
                }
                W[i] = Math.sqrt(sd);
            }

            for (i = 0; i < n - 1; i++) {
                j = i;
                for (k = i + 1; k < n; k++) {
                    if (W[j] < W[k])
                        j = k;
                }
                if (i != j) {
                    swap(W, i, j, sd);
                    if (Vt) {
                        for (k = 0; k < m; k++) {
                            swap(At, i * astep + k, j * astep + k, t);
                        }

                        for (k = 0; k < n; k++) {
                            swap(Vt, i * vstep + k, j * vstep + k, t);
                        }
                    }
                }
            }

            for (i = 0; i < n; i++) {
                _W[i] = W[i];
            }

            if (!Vt) {
                jsfeat.cache.put_buffer(W_buff);
                return;
            }

            for (i = 0; i < n1; i++) {

                sd = i < n ? W[i] : 0;

                while (sd <= minval) {
                    // if we got a zero singular value, then in order to get the corresponding left singular vector
                    // we generate a random vector, project it to the previously computed left singular vectors,
                    // subtract the projection and normalize the difference.
                    val0 = (1.0 / m);
                    for (k = 0; k < m; k++) {
                        seed = (seed * 214013 + 2531011);
                        val = (((seed >> 16) & 0x7fff) & 256) != 0 ? val0 : -val0;
                        At[i * astep + k] = val;
                    }
                    for (iter = 0; iter < 2; iter++) {
                        for (j = 0; j < i; j++) {
                            sd = 0;
                            for (k = 0; k < m; k++) {
                                sd += At[i * astep + k] * At[j * astep + k];
                            }
                            asum = 0.0;
                            for (k = 0; k < m; k++) {
                                t = (At[i * astep + k] - sd * At[j * astep + k]);
                                At[i * astep + k] = t;
                                asum += Math.abs(t);
                            }
                            asum = asum ? 1.0 / asum : 0;
                            for (k = 0; k < m; k++) {
                                At[i * astep + k] *= asum;
                            }
                        }
                    }
                    sd = 0;
                    for (k = 0; k < m; k++) {
                        t = At[i * astep + k];
                        sd += t * t;
                    }
                    sd = Math.sqrt(sd);
                }

                s = (1.0 / sd);
                for (k = 0; k < m; k++) {
                    At[i * astep + k] *= s;
                }
            }

            jsfeat.cache.put_buffer(W_buff);
        }

        return {

            lu_solve: function (A, B) {
                var i = 0, j = 0, k = 0, p = 1, astep = A.cols;
                var ad = A.data, bd = B.data;
                var t, alpha, d, s;

                for (i = 0; i < astep; i++) {
                    k = i;
                    for (j = i + 1; j < astep; j++) {
                        if (Math.abs(ad[j * astep + i]) > Math.abs(ad[k * astep + i])) {
                            k = j;
                        }
                    }

                    if (Math.abs(ad[k * astep + i]) < jsfeat.EPSILON) {
                        return 0; // FAILED
                    }

                    if (k != i) {
                        for (j = i; j < astep; j++) {
                            swap(ad, i * astep + j, k * astep + j, t);
                        }

                        swap(bd, i, k, t);
                        p = -p;
                    }

                    d = -1.0 / ad[i * astep + i];

                    for (j = i + 1; j < astep; j++) {
                        alpha = ad[j * astep + i] * d;

                        for (k = i + 1; k < astep; k++) {
                            ad[j * astep + k] += alpha * ad[i * astep + k];
                        }

                        bd[j] += alpha * bd[i];
                    }

                    ad[i * astep + i] = -d;
                }

                for (i = astep - 1; i >= 0; i--) {
                    s = bd[i];
                    for (k = i + 1; k < astep; k++) {
                        s -= ad[i * astep + k] * bd[k];
                    }
                    bd[i] = s * ad[i * astep + i];
                }

                return 1; // OK
            },

            cholesky_solve: function (A, B) {
                var col = 0, row = 0, col2 = 0, cs = 0, rs = 0, i = 0, j = 0;
                var size = A.cols;
                var ad = A.data, bd = B.data;
                var val, inv_diag;

                for (col = 0; col < size; col++) {
                    inv_diag = 1.0;
                    cs = (col * size);
                    rs = cs;
                    for (row = col; row < size; row++) {
                        // correct for the parts of cholesky already computed
                        val = ad[(rs + col)];
                        for (col2 = 0; col2 < col; col2++) {
                            val -= ad[(col2 * size + col)] * ad[(rs + col2)];
                        }
                        if (row == col) {
                            // this is the diagonal element so don't divide
                            ad[(rs + col)] = val;
                            if (val == 0) {
                                return 0;
                            }
                            inv_diag = 1.0 / val;
                        } else {
                            // cache the value without division in the upper half
                            ad[(cs + row)] = val;
                            // divide my the diagonal element for all others
                            ad[(rs + col)] = val * inv_diag;
                        }
                        rs = (rs + size);
                    }
                }

                // first backsub through L
                cs = 0;
                for (i = 0; i < size; i++) {
                    val = bd[i];
                    for (j = 0; j < i; j++) {
                        val -= ad[(cs + j)] * bd[j];
                    }
                    bd[i] = val;
                    cs = (cs + size);
                }
                // backsub through diagonal
                cs = 0;
                for (i = 0; i < size; i++) {
                    bd[i] /= ad[(cs + i)];
                    cs = (cs + size);
                }
                // backsub through L Transpose
                i = (size - 1);
                for (; i >= 0; i--) {
                    val = bd[i];
                    j = (i + 1);
                    cs = (j * size);
                    for (; j < size; j++) {
                        val -= ad[(cs + i)] * bd[j];
                        cs = (cs + size);
                    }
                    bd[i] = val;
                }

                return 1;
            },

            svd_decompose: function (A, W, U, V, options) {
                if (typeof options === "undefined") { options = 0; };
                var at = 0, i = 0, j = 0, _m = A.rows, _n = A.cols, m = _m, n = _n;
                var dt = A.type | jsfeat.C1_t; // we only work with single channel

                if (m < n) {
                    at = 1;
                    i = m;
                    m = n;
                    n = i;
                }

                var a_buff = jsfeat.cache.get_buffer((m * m) << 3);
                var w_buff = jsfeat.cache.get_buffer(n << 3);
                var v_buff = jsfeat.cache.get_buffer((n * n) << 3);

                var a_mt = new jsfeat.matrix_t(m, m, dt, a_buff.data);
                var w_mt = new jsfeat.matrix_t(1, n, dt, w_buff.data);
                var v_mt = new jsfeat.matrix_t(n, n, dt, v_buff.data);

                if (at == 0) {
                    // transpose
                    jsfeat.matmath.transpose(a_mt, A);
                } else {
                    for (i = 0; i < _n * _m; i++) {
                        a_mt.data[i] = A.data[i];
                    }
                    for (; i < n * m; i++) {
                        a_mt.data[i] = 0;
                    }
                }

                JacobiSVDImpl(a_mt.data, m, w_mt.data, v_mt.data, n, m, n, m);

                if (W) {
                    for (i = 0; i < n; i++) {
                        W.data[i] = w_mt.data[i];
                    }
                    for (; i < _n; i++) {
                        W.data[i] = 0;
                    }
                }

                if (at == 0) {
                    if (U && (options & jsfeat.SVD_U_T)) {
                        i = m * m;
                        while (--i >= 0) {
                            U.data[i] = a_mt.data[i];
                        }
                    } else if (U) {
                        jsfeat.matmath.transpose(U, a_mt);
                    }

                    if (V && (options & jsfeat.SVD_V_T)) {
                        i = n * n;
                        while (--i >= 0) {
                            V.data[i] = v_mt.data[i];
                        }
                    } else if (V) {
                        jsfeat.matmath.transpose(V, v_mt);
                    }
                } else {
                    if (U && (options & jsfeat.SVD_U_T)) {
                        i = n * n;
                        while (--i >= 0) {
                            U.data[i] = v_mt.data[i];
                        }
                    } else if (U) {
                        jsfeat.matmath.transpose(U, v_mt);
                    }

                    if (V && (options & jsfeat.SVD_V_T)) {
                        i = m * m;
                        while (--i >= 0) {
                            V.data[i] = a_mt.data[i];
                        }
                    } else if (V) {
                        jsfeat.matmath.transpose(V, a_mt);
                    }
                }

                jsfeat.cache.put_buffer(a_buff);
                jsfeat.cache.put_buffer(w_buff);
                jsfeat.cache.put_buffer(v_buff);

            },

            svd_solve: function (A, X, B) {
                var i = 0, j = 0, k = 0;
                var pu = 0, pv = 0;
                var nrows = A.rows, ncols = A.cols;
                var sum = 0.0, xsum = 0.0, tol = 0.0;
                var dt = A.type | jsfeat.C1_t;

                var u_buff = jsfeat.cache.get_buffer((nrows * nrows) << 3);
                var w_buff = jsfeat.cache.get_buffer(ncols << 3);
                var v_buff = jsfeat.cache.get_buffer((ncols * ncols) << 3);

                var u_mt = new jsfeat.matrix_t(nrows, nrows, dt, u_buff.data);
                var w_mt = new jsfeat.matrix_t(1, ncols, dt, w_buff.data);
                var v_mt = new jsfeat.matrix_t(ncols, ncols, dt, v_buff.data);

                var bd = B.data, ud = u_mt.data, wd = w_mt.data, vd = v_mt.data;

                this.svd_decompose(A, w_mt, u_mt, v_mt, 0);

                tol = jsfeat.EPSILON * wd[0] * ncols;

                for (; i < ncols; i++, pv += ncols) {
                    xsum = 0.0;
                    for (j = 0; j < ncols; j++) {
                        if (wd[j] > tol) {
                            for (k = 0, sum = 0.0, pu = 0; k < nrows; k++, pu += ncols) {
                                sum += ud[pu + j] * bd[k];
                            }
                            xsum += sum * vd[pv + j] / wd[j];
                        }
                    }
                    X.data[i] = xsum;
                }

                jsfeat.cache.put_buffer(u_buff);
                jsfeat.cache.put_buffer(w_buff);
                jsfeat.cache.put_buffer(v_buff);
            },

            svd_invert: function (Ai, A) {
                var i = 0, j = 0, k = 0;
                var pu = 0, pv = 0, pa = 0;
                var nrows = A.rows, ncols = A.cols;
                var sum = 0.0, tol = 0.0;
                var dt = A.type | jsfeat.C1_t;

                var u_buff = jsfeat.cache.get_buffer((nrows * nrows) << 3);
                var w_buff = jsfeat.cache.get_buffer(ncols << 3);
                var v_buff = jsfeat.cache.get_buffer((ncols * ncols) << 3);

                var u_mt = new jsfeat.matrix_t(nrows, nrows, dt, u_buff.data);
                var w_mt = new jsfeat.matrix_t(1, ncols, dt, w_buff.data);
                var v_mt = new jsfeat.matrix_t(ncols, ncols, dt, v_buff.data);

                var id = Ai.data, ud = u_mt.data, wd = w_mt.data, vd = v_mt.data;

                this.svd_decompose(A, w_mt, u_mt, v_mt, 0);

                tol = jsfeat.EPSILON * wd[0] * ncols;

                for (; i < ncols; i++, pv += ncols) {
                    for (j = 0, pu = 0; j < nrows; j++, pa++) {
                        for (k = 0, sum = 0.0; k < ncols; k++, pu++) {
                            if (wd[k] > tol) sum += vd[pv + k] * ud[pu] / wd[k];
                        }
                        id[pa] = sum;
                    }
                }

                jsfeat.cache.put_buffer(u_buff);
                jsfeat.cache.put_buffer(w_buff);
                jsfeat.cache.put_buffer(v_buff);
            },

            eigenVV: function (A, vects, vals) {
                var n = A.cols, i = n * n;
                var dt = A.type | jsfeat.C1_t;

                var a_buff = jsfeat.cache.get_buffer((n * n) << 3);
                var w_buff = jsfeat.cache.get_buffer(n << 3);
                var a_mt = new jsfeat.matrix_t(n, n, dt, a_buff.data);
                var w_mt = new jsfeat.matrix_t(1, n, dt, w_buff.data);

                while (--i >= 0) {
                    a_mt.data[i] = A.data[i];
                }

                JacobiImpl(a_mt.data, n, w_mt.data, vects ? vects.data : null, n, n);

                if (vals) {
                    while (--n >= 0) {
                        vals.data[n] = w_mt.data[n];
                    }
                }

                jsfeat.cache.put_buffer(a_buff);
                jsfeat.cache.put_buffer(w_buff);
            }

        };

    })();

    global.linalg = linalg;

})(jsfeat);
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 *
 */

(function (global) {
    "use strict";
    //

    var motion_model = (function () {

        var sqr = function (x) {
            return x * x;
        }

        // does isotropic normalization
        var iso_normalize_points = function (from, to, T0, T1, count) {
            var i = 0;
            var cx0 = 0.0, cy0 = 0.0, d0 = 0.0, s0 = 0.0;
            var cx1 = 0.0, cy1 = 0.0, d1 = 0.0, s1 = 0.0;
            var dx = 0.0, dy = 0.0;

            for (; i < count; ++i) {
                cx0 += from[i].x;
                cy0 += from[i].y;
                cx1 += to[i].x;
                cy1 += to[i].y;
            }

            cx0 /= count; cy0 /= count;
            cx1 /= count; cy1 /= count;

            for (i = 0; i < count; ++i) {
                dx = from[i].x - cx0;
                dy = from[i].y - cy0;
                d0 += Math.sqrt(dx * dx + dy * dy);
                dx = to[i].x - cx1;
                dy = to[i].y - cy1;
                d1 += Math.sqrt(dx * dx + dy * dy);
            }

            d0 /= count; d1 /= count;

            s0 = Math.SQRT2 / d0; s1 = Math.SQRT2 / d1;

            T0[0] = T0[4] = s0;
            T0[2] = -cx0 * s0;
            T0[5] = -cy0 * s0;
            T0[1] = T0[3] = T0[6] = T0[7] = 0.0;
            T0[8] = 1.0;

            T1[0] = T1[4] = s1;
            T1[2] = -cx1 * s1;
            T1[5] = -cy1 * s1;
            T1[1] = T1[3] = T1[6] = T1[7] = 0.0;
            T1[8] = 1.0;
        }

        var have_collinear_points = function (points, count) {
            var j = 0, k = 0, i = (count - 1) | 0;
            var dx1 = 0.0, dy1 = 0.0, dx2 = 0.0, dy2 = 0.0;

            // check that the i-th selected point does not belong
            // to a line connecting some previously selected points
            for (; j < i; ++j) {
                dx1 = points[j].x - points[i].x;
                dy1 = points[j].y - points[i].y;
                for (k = 0; k < j; ++k) {
                    dx2 = points[k].x - points[i].x;
                    dy2 = points[k].y - points[i].y;
                    if (Math.abs(dx2 * dy1 - dy2 * dx1) <= jsfeat.EPSILON * (Math.abs(dx1) + Math.abs(dy1) + Math.abs(dx2) + Math.abs(dy2)))
                        return true;
                }
            }
            return false;
        }

        var T0 = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);
        var T1 = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);
        var AtA = new jsfeat.matrix_t(6, 6, jsfeat.F32_t | jsfeat.C1_t);
        var AtB = new jsfeat.matrix_t(6, 1, jsfeat.F32_t | jsfeat.C1_t);

        var affine2d = (function () {

            function affine2d() {
                // empty constructor
            }

            affine2d.prototype.run = function (from, to, model, count) {
                var i = 0, j = 0;
                var dt = model.type | jsfeat.C1_t;
                var md = model.data, t0d = T0.data, t1d = T1.data;
                var pt0, pt1, px = 0.0, py = 0.0;

                iso_normalize_points(from, to, t0d, t1d, count);

                var a_buff = jsfeat.cache.get_buffer((2 * count * 6) << 3);
                var b_buff = jsfeat.cache.get_buffer((2 * count) << 3);

                var a_mt = new jsfeat.matrix_t(6, 2 * count, dt, a_buff.data);
                var b_mt = new jsfeat.matrix_t(1, 2 * count, dt, b_buff.data);
                var ad = a_mt.data, bd = b_mt.data;

                for (; i < count; ++i) {
                    pt0 = from[i];
                    pt1 = to[i];

                    px = t0d[0] * pt0.x + t0d[1] * pt0.y + t0d[2];
                    py = t0d[3] * pt0.x + t0d[4] * pt0.y + t0d[5];

                    j = i * 2 * 6;
                    ad[j] = px, ad[j + 1] = py, ad[j + 2] = 1.0, ad[j + 3] = 0.0, ad[j + 4] = 0.0, ad[j + 5] = 0.0;

                    j += 6;
                    ad[j] = 0.0, ad[j + 1] = 0.0, ad[j + 2] = 0.0, ad[j + 3] = px, ad[j + 4] = py, ad[j + 5] = 1.0;

                    bd[i << 1] = t1d[0] * pt1.x + t1d[1] * pt1.y + t1d[2];
                    bd[(i << 1) + 1] = t1d[3] * pt1.x + t1d[4] * pt1.y + t1d[5];
                }

                jsfeat.matmath.multiply_AtA(AtA, a_mt);
                jsfeat.matmath.multiply_AtB(AtB, a_mt, b_mt);

                jsfeat.linalg.lu_solve(AtA, AtB);

                md[0] = AtB.data[0], md[1] = AtB.data[1], md[2] = AtB.data[2];
                md[3] = AtB.data[3], md[4] = AtB.data[4], md[5] = AtB.data[5];
                md[6] = 0.0, md[7] = 0.0, md[8] = 1.0; // fill last row

                // denormalize
                jsfeat.matmath.invert_3x3(T1, T1);
                jsfeat.matmath.multiply_3x3(model, T1, model);
                jsfeat.matmath.multiply_3x3(model, model, T0);

                // free buffer
                jsfeat.cache.put_buffer(a_buff);
                jsfeat.cache.put_buffer(b_buff);

                return 1;
            }

            affine2d.prototype.error = function (from, to, model, err, count) {
                var i = 0;
                var pt0, pt1;
                var m = model.data;

                for (; i < count; ++i) {
                    pt0 = from[i];
                    pt1 = to[i];

                    err[i] = sqr(pt1.x - m[0] * pt0.x - m[1] * pt0.y - m[2]) +
			                 sqr(pt1.y - m[3] * pt0.x - m[4] * pt0.y - m[5]);
                }
            }

            affine2d.prototype.check_subset = function (from, to, count) {
                return true; // all good
            }

            return affine2d;
        })();

        var mLtL = new jsfeat.matrix_t(9, 9, jsfeat.F32_t | jsfeat.C1_t);
        var Evec = new jsfeat.matrix_t(9, 9, jsfeat.F32_t | jsfeat.C1_t);

        var homography2d = (function () {

            function homography2d() {
                // empty constructor
                //this.T0 = new jsfeat.matrix_t(3, 3, jsfeat.F32_t|jsfeat.C1_t);
                //this.T1 = new jsfeat.matrix_t(3, 3, jsfeat.F32_t|jsfeat.C1_t);
                //this.mLtL = new jsfeat.matrix_t(9, 9, jsfeat.F32_t|jsfeat.C1_t);
                //this.Evec = new jsfeat.matrix_t(9, 9, jsfeat.F32_t|jsfeat.C1_t);
            }

            homography2d.prototype.run = function (from, to, model, count) {
                var i = 0, j = 0;
                var md = model.data, t0d = T0.data, t1d = T1.data;
                var LtL = mLtL.data, evd = Evec.data;
                var x = 0.0, y = 0.0, X = 0.0, Y = 0.0;

                // norm
                var smx = 0.0, smy = 0.0, cmx = 0.0, cmy = 0.0, sMx = 0.0, sMy = 0.0, cMx = 0.0, cMy = 0.0;

                for (; i < count; ++i) {
                    cmx += to[i].x;
                    cmy += to[i].y;
                    cMx += from[i].x;
                    cMy += from[i].y;
                }

                cmx /= count; cmy /= count;
                cMx /= count; cMy /= count;

                for (i = 0; i < count; ++i) {
                    smx += Math.abs(to[i].x - cmx);
                    smy += Math.abs(to[i].y - cmy);
                    sMx += Math.abs(from[i].x - cMx);
                    sMy += Math.abs(from[i].y - cMy);
                }

                if (Math.abs(smx) < jsfeat.EPSILON
			    	|| Math.abs(smy) < jsfeat.EPSILON
			    	|| Math.abs(sMx) < jsfeat.EPSILON
			    	|| Math.abs(sMy) < jsfeat.EPSILON) return 0;

                smx = count / smx; smy = count / smy;
                sMx = count / sMx; sMy = count / sMy;

                t0d[0] = sMx; t0d[1] = 0; t0d[2] = -cMx * sMx;
                t0d[3] = 0; t0d[4] = sMy; t0d[5] = -cMy * sMy;
                t0d[6] = 0; t0d[7] = 0; t0d[8] = 1;

                t1d[0] = 1.0 / smx; t1d[1] = 0; t1d[2] = cmx;
                t1d[3] = 0; t1d[4] = 1.0 / smy; t1d[5] = cmy;
                t1d[6] = 0; t1d[7] = 0; t1d[8] = 1;
                //

                // construct system
                i = 81;
                while (--i >= 0) {
                    LtL[i] = 0.0;
                }
                for (i = 0; i < count; ++i) {
                    x = (to[i].x - cmx) * smx;
                    y = (to[i].y - cmy) * smy;
                    X = (from[i].x - cMx) * sMx;
                    Y = (from[i].y - cMy) * sMy;

                    LtL[0] += X * X;
                    LtL[1] += X * Y;
                    LtL[2] += X;

                    LtL[6] += X * -x * X;
                    LtL[7] += X * -x * Y;
                    LtL[8] += X * -x;
                    LtL[10] += Y * Y;
                    LtL[11] += Y;

                    LtL[15] += Y * -x * X;
                    LtL[16] += Y * -x * Y;
                    LtL[17] += Y * -x;
                    LtL[20] += 1.0;

                    LtL[24] += -x * X;
                    LtL[25] += -x * Y;
                    LtL[26] += -x;
                    LtL[30] += X * X;
                    LtL[31] += X * Y;
                    LtL[32] += X;
                    LtL[33] += X * -y * X;
                    LtL[34] += X * -y * Y;
                    LtL[35] += X * -y;
                    LtL[40] += Y * Y;
                    LtL[41] += Y;
                    LtL[42] += Y * -y * X;
                    LtL[43] += Y * -y * Y;
                    LtL[44] += Y * -y;
                    LtL[50] += 1.0;
                    LtL[51] += -y * X;
                    LtL[52] += -y * Y;
                    LtL[53] += -y;
                    LtL[60] += -x * X * -x * X + -y * X * -y * X;
                    LtL[61] += -x * X * -x * Y + -y * X * -y * Y;
                    LtL[62] += -x * X * -x + -y * X * -y;
                    LtL[70] += -x * Y * -x * Y + -y * Y * -y * Y;
                    LtL[71] += -x * Y * -x + -y * Y * -y;
                    LtL[80] += -x * -x + -y * -y;
                }
                //

                // symmetry
                for (i = 0; i < 9; ++i) {
                    for (j = 0; j < i; ++j)
                        LtL[i * 9 + j] = LtL[j * 9 + i];
                }

                jsfeat.linalg.eigenVV(mLtL, Evec);

                md[0] = evd[72], md[1] = evd[73], md[2] = evd[74];
                md[3] = evd[75], md[4] = evd[76], md[5] = evd[77];
                md[6] = evd[78], md[7] = evd[79], md[8] = evd[80];

                // denormalize
                jsfeat.matmath.multiply_3x3(model, T1, model);
                jsfeat.matmath.multiply_3x3(model, model, T0);

                // set bottom right to 1.0
                x = 1.0 / md[8];
                md[0] *= x; md[1] *= x; md[2] *= x;
                md[3] *= x; md[4] *= x; md[5] *= x;
                md[6] *= x; md[7] *= x; md[8] = 1.0;

                return 1;
            }

            homography2d.prototype.error = function (from, to, model, err, count) {
                var i = 0;
                var pt0, pt1, ww = 0.0, dx = 0.0, dy = 0.0;
                var m = model.data;

                for (; i < count; ++i) {
                    pt0 = from[i];
                    pt1 = to[i];

                    ww = 1.0 / (m[6] * pt0.x + m[7] * pt0.y + 1.0);
                    dx = (m[0] * pt0.x + m[1] * pt0.y + m[2]) * ww - pt1.x;
                    dy = (m[3] * pt0.x + m[4] * pt0.y + m[5]) * ww - pt1.y;
                    err[i] = (dx * dx + dy * dy);
                }
            }

            homography2d.prototype.check_subset = function (from, to, count) {
                // seems to reject good subsets actually
                //if( have_collinear_points(from, count) || have_collinear_points(to, count) ) {
                //return false;
                //}
                if (count == 4) {
                    var negative = 0;

                    var fp0 = from[0], fp1 = from[1], fp2 = from[2], fp3 = from[3];
                    var tp0 = to[0], tp1 = to[1], tp2 = to[2], tp3 = to[3];

                    // set1
                    var A11 = fp0.x, A12 = fp0.y, A13 = 1.0;
                    var A21 = fp1.x, A22 = fp1.y, A23 = 1.0;
                    var A31 = fp2.x, A32 = fp2.y, A33 = 1.0;

                    var B11 = tp0.x, B12 = tp0.y, B13 = 1.0;
                    var B21 = tp1.x, B22 = tp1.y, B23 = 1.0;
                    var B31 = tp2.x, B32 = tp2.y, B33 = 1.0;

                    var detA = jsfeat.matmath.determinant_3x3(A11, A12, A13, A21, A22, A23, A31, A32, A33);
                    var detB = jsfeat.matmath.determinant_3x3(B11, B12, B13, B21, B22, B23, B31, B32, B33);

                    if (detA * detB < 0) negative++;

                    // set2
                    A11 = fp1.x, A12 = fp1.y;
                    A21 = fp2.x, A22 = fp2.y;
                    A31 = fp3.x, A32 = fp3.y;

                    B11 = tp1.x, B12 = tp1.y;
                    B21 = tp2.x, B22 = tp2.y;
                    B31 = tp3.x, B32 = tp3.y;

                    detA = jsfeat.matmath.determinant_3x3(A11, A12, A13, A21, A22, A23, A31, A32, A33);
                    detB = jsfeat.matmath.determinant_3x3(B11, B12, B13, B21, B22, B23, B31, B32, B33);

                    if (detA * detB < 0) negative++;

                    // set3
                    A11 = fp0.x, A12 = fp0.y;
                    A21 = fp2.x, A22 = fp2.y;
                    A31 = fp3.x, A32 = fp3.y;

                    B11 = tp0.x, B12 = tp0.y;
                    B21 = tp2.x, B22 = tp2.y;
                    B31 = tp3.x, B32 = tp3.y;

                    detA = jsfeat.matmath.determinant_3x3(A11, A12, A13, A21, A22, A23, A31, A32, A33);
                    detB = jsfeat.matmath.determinant_3x3(B11, B12, B13, B21, B22, B23, B31, B32, B33);

                    if (detA * detB < 0) negative++;

                    // set4
                    A11 = fp0.x, A12 = fp0.y;
                    A21 = fp1.x, A22 = fp1.y;
                    A31 = fp3.x, A32 = fp3.y;

                    B11 = tp0.x, B12 = tp0.y;
                    B21 = tp1.x, B22 = tp1.y;
                    B31 = tp3.x, B32 = tp3.y;

                    detA = jsfeat.matmath.determinant_3x3(A11, A12, A13, A21, A22, A23, A31, A32, A33);
                    detB = jsfeat.matmath.determinant_3x3(B11, B12, B13, B21, B22, B23, B31, B32, B33);

                    if (detA * detB < 0) negative++;

                    if (negative != 0 && negative != 4) {
                        return false;
                    }
                }
                return true; // all good
            }

            return homography2d;
        })();

        return {

            affine2d: affine2d,
            homography2d: homography2d

        };

    })();

    var ransac_params_t = (function () {
        function ransac_params_t(size, thresh, eps, prob) {
            if (typeof size === "undefined") { size = 0; }
            if (typeof thresh === "undefined") { thresh = 0.5; }
            if (typeof eps === "undefined") { eps = 0.5; }
            if (typeof prob === "undefined") { prob = 0.99; }

            this.size = size;
            this.thresh = thresh;
            this.eps = eps;
            this.prob = prob;
        };
        ransac_params_t.prototype.update_iters = function (_eps, max_iters) {
            var num = Math.log(1 - this.prob);
            var denom = Math.log(1 - Math.pow(1 - _eps, this.size));
            return (denom >= 0 || -num >= max_iters * (-denom) ? max_iters : Math.round(num / denom)) | 0;
        };
        return ransac_params_t;
    })();

    var motion_estimator = (function () {

        var get_subset = function (kernel, from, to, need_cnt, max_cnt, from_sub, to_sub) {
            var max_try = 1000;
            var indices = [];
            var i = 0, j = 0, ssiter = 0, idx_i = 0, ok = false;
            for (; ssiter < max_try; ++ssiter) {
                i = 0;
                for (; i < need_cnt && ssiter < max_try;) {
                    ok = false;
                    idx_i = 0;
                    while (!ok) {
                        ok = true;
                        idx_i = indices[i] = Math.floor(Math.random() * max_cnt) | 0;
                        for (j = 0; j < i; ++j) {
                            if (idx_i == indices[j])
                            { ok = false; break; }
                        }
                    }
                    from_sub[i] = from[idx_i];
                    to_sub[i] = to[idx_i];
                    if (!kernel.check_subset(from_sub, to_sub, i + 1)) {
                        ssiter++;
                        continue;
                    }
                    ++i;
                }
                break;
            }

            return (i == need_cnt && ssiter < max_try);
        }

        var find_inliers = function (kernel, model, from, to, count, thresh, err, mask) {
            var numinliers = 0, i = 0, f = 0;
            var t = thresh * thresh;

            kernel.error(from, to, model, err, count);

            for (; i < count; ++i) {
                f = err[i] <= t;
                mask[i] = f;
                numinliers += f;
            }
            return numinliers;
        }

        return {

            ransac: function (params, kernel, from, to, count, model, mask, max_iters) {
                if (typeof max_iters === "undefined") { max_iters = 1000; }

                if (count < params.size) return false;

                var model_points = params.size;
                var niters = max_iters, iter = 0;
                var result = false;

                var subset0 = [];
                var subset1 = [];
                var found = false;

                var mc = model.cols, mr = model.rows;
                var dt = model.type | jsfeat.C1_t;

                var m_buff = jsfeat.cache.get_buffer((mc * mr) << 3);
                var ms_buff = jsfeat.cache.get_buffer(count);
                var err_buff = jsfeat.cache.get_buffer(count << 2);
                var M = new jsfeat.matrix_t(mc, mr, dt, m_buff.data);
                var curr_mask = new jsfeat.matrix_t(count, 1, jsfeat.U8C1_t, ms_buff.data);

                var inliers_max = -1, numinliers = 0;
                var nmodels = 0;

                var err = err_buff.f32;

                // special case
                if (count == model_points) {
                    if (kernel.run(from, to, M, count) <= 0) {
                        jsfeat.cache.put_buffer(m_buff);
                        jsfeat.cache.put_buffer(ms_buff);
                        jsfeat.cache.put_buffer(err_buff);
                        return false;
                    }

                    M.copy_to(model);
                    if (mask) {
                        while (--count >= 0) {
                            mask.data[count] = 1;
                        }
                    }
                    jsfeat.cache.put_buffer(m_buff);
                    jsfeat.cache.put_buffer(ms_buff);
                    jsfeat.cache.put_buffer(err_buff);
                    return true;
                }

                for (; iter < niters; ++iter) {
                    // generate subset
                    found = get_subset(kernel, from, to, model_points, count, subset0, subset1);
                    if (!found) {
                        if (iter == 0) {
                            jsfeat.cache.put_buffer(m_buff);
                            jsfeat.cache.put_buffer(ms_buff);
                            jsfeat.cache.put_buffer(err_buff);
                            return false;
                        }
                        break;
                    }

                    nmodels = kernel.run(subset0, subset1, M, model_points);
                    if (nmodels <= 0)
                        continue;

                    // TODO handle multimodel output

                    numinliers = find_inliers(kernel, M, from, to, count, params.thresh, err, curr_mask.data);

                    if (numinliers > Math.max(inliers_max, model_points - 1)) {
                        M.copy_to(model);
                        inliers_max = numinliers;
                        if (mask) curr_mask.copy_to(mask);
                        niters = params.update_iters((count - numinliers) / count, niters);
                        result = true;
                    }
                }

                jsfeat.cache.put_buffer(m_buff);
                jsfeat.cache.put_buffer(ms_buff);
                jsfeat.cache.put_buffer(err_buff);

                return result;
            },

            lmeds: function (params, kernel, from, to, count, model, mask, max_iters) {
                if (typeof max_iters === "undefined") { max_iters = 1000; }

                if (count < params.size) return false;

                var model_points = params.size;
                var niters = max_iters, iter = 0;
                var result = false;

                var subset0 = [];
                var subset1 = [];
                var found = false;

                var mc = model.cols, mr = model.rows;
                var dt = model.type | jsfeat.C1_t;

                var m_buff = jsfeat.cache.get_buffer((mc * mr) << 3);
                var ms_buff = jsfeat.cache.get_buffer(count);
                var err_buff = jsfeat.cache.get_buffer(count << 2);
                var M = new jsfeat.matrix_t(mc, mr, dt, m_buff.data);
                var curr_mask = new jsfeat.matrix_t(count, 1, jsfeat.U8_t | jsfeat.C1_t, ms_buff.data);

                var numinliers = 0;
                var nmodels = 0;

                var err = err_buff.f32;
                var min_median = 1000000000.0, sigma = 0.0, median = 0.0;

                params.eps = 0.45;
                niters = params.update_iters(params.eps, niters);

                // special case
                if (count == model_points) {
                    if (kernel.run(from, to, M, count) <= 0) {
                        jsfeat.cache.put_buffer(m_buff);
                        jsfeat.cache.put_buffer(ms_buff);
                        jsfeat.cache.put_buffer(err_buff);
                        return false;
                    }

                    M.copy_to(model);
                    if (mask) {
                        while (--count >= 0) {
                            mask.data[count] = 1;
                        }
                    }
                    jsfeat.cache.put_buffer(m_buff);
                    jsfeat.cache.put_buffer(ms_buff);
                    jsfeat.cache.put_buffer(err_buff);
                    return true;
                }

                for (; iter < niters; ++iter) {
                    // generate subset
                    found = get_subset(kernel, from, to, model_points, count, subset0, subset1);
                    if (!found) {
                        if (iter == 0) {
                            jsfeat.cache.put_buffer(m_buff);
                            jsfeat.cache.put_buffer(ms_buff);
                            jsfeat.cache.put_buffer(err_buff);
                            return false;
                        }
                        break;
                    }

                    nmodels = kernel.run(subset0, subset1, M, model_points);
                    if (nmodels <= 0)
                        continue;

                    // TODO handle multimodel output

                    kernel.error(from, to, M, err, count);
                    median = jsfeat.math.median(err, 0, count - 1);

                    if (median < min_median) {
                        min_median = median;
                        M.copy_to(model);
                        result = true;
                    }
                }

                if (result) {
                    sigma = 2.5 * 1.4826 * (1 + 5.0 / (count - model_points)) * Math.sqrt(min_median);
                    sigma = Math.max(sigma, 0.001);

                    numinliers = find_inliers(kernel, model, from, to, count, sigma, err, curr_mask.data);
                    if (mask) curr_mask.copy_to(mask);

                    result = numinliers >= model_points;
                }

                jsfeat.cache.put_buffer(m_buff);
                jsfeat.cache.put_buffer(ms_buff);
                jsfeat.cache.put_buffer(err_buff);

                return result;
            }

        };

    })();

    global.ransac_params_t = ransac_params_t;
    global.motion_model = motion_model;
    global.motion_estimator = motion_estimator;

})(jsfeat);
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 */

(function (global) {
    "use strict";
    //

    var imgproc = (function () {

        var _resample_u8 = function (src, dst, nw, nh) {
            var xofs_count = 0;
            var ch = src.channel, w = src.cols, h = src.rows;
            var src_d = src.data, dst_d = dst.data;
            var scale_x = w / nw, scale_y = h / nh;
            var inv_scale_256 = (scale_x * scale_y * 0x10000) | 0;
            var dx = 0, dy = 0, sx = 0, sy = 0, sx1 = 0, sx2 = 0, i = 0, k = 0, fsx1 = 0.0, fsx2 = 0.0;
            var a = 0, b = 0, dxn = 0, alpha = 0, beta = 0, beta1 = 0;

            var buf_node = jsfeat.cache.get_buffer((nw * ch) << 2);
            var sum_node = jsfeat.cache.get_buffer((nw * ch) << 2);
            var xofs_node = jsfeat.cache.get_buffer((w * 2 * 3) << 2);

            var buf = buf_node.i32;
            var sum = sum_node.i32;
            var xofs = xofs_node.i32;

            for (; dx < nw; dx++) {
                fsx1 = dx * scale_x, fsx2 = fsx1 + scale_x;
                sx1 = (fsx1 + 1.0 - 1e-6) | 0, sx2 = fsx2 | 0;
                sx1 = Math.min(sx1, w - 1);
                sx2 = Math.min(sx2, w - 1);

                if (sx1 > fsx1) {
                    xofs[k++] = (dx * ch) | 0;
                    xofs[k++] = ((sx1 - 1) * ch) | 0;
                    xofs[k++] = ((sx1 - fsx1) * 0x100) | 0;
                    xofs_count++;
                }
                for (sx = sx1; sx < sx2; sx++) {
                    xofs_count++;
                    xofs[k++] = (dx * ch) | 0;
                    xofs[k++] = (sx * ch) | 0;
                    xofs[k++] = 256;
                }
                if (fsx2 - sx2 > 1e-3) {
                    xofs_count++;
                    xofs[k++] = (dx * ch) | 0;
                    xofs[k++] = (sx2 * ch) | 0;
                    xofs[k++] = ((fsx2 - sx2) * 256) | 0;
                }
            }

            for (dx = 0; dx < nw * ch; dx++) {
                buf[dx] = sum[dx] = 0;
            }
            dy = 0;
            for (sy = 0; sy < h; sy++) {
                a = w * sy;
                for (k = 0; k < xofs_count; k++) {
                    dxn = xofs[k * 3];
                    sx1 = xofs[k * 3 + 1];
                    alpha = xofs[k * 3 + 2];
                    for (i = 0; i < ch; i++) {
                        buf[dxn + i] += src_d[a + sx1 + i] * alpha;
                    }
                }
                if ((dy + 1) * scale_y <= sy + 1 || sy == h - 1) {
                    beta = (Math.max(sy + 1 - (dy + 1) * scale_y, 0.0) * 256) | 0;
                    beta1 = 256 - beta;
                    b = nw * dy;
                    if (beta <= 0) {
                        for (dx = 0; dx < nw * ch; dx++) {
                            dst_d[b + dx] = Math.min(Math.max((sum[dx] + buf[dx] * 256) / inv_scale_256, 0), 255);
                            sum[dx] = buf[dx] = 0;
                        }
                    } else {
                        for (dx = 0; dx < nw * ch; dx++) {
                            dst_d[b + dx] = Math.min(Math.max((sum[dx] + buf[dx] * beta1) / inv_scale_256, 0), 255);
                            sum[dx] = buf[dx] * beta;
                            buf[dx] = 0;
                        }
                    }
                    dy++;
                } else {
                    for (dx = 0; dx < nw * ch; dx++) {
                        sum[dx] += buf[dx] * 256;
                        buf[dx] = 0;
                    }
                }
            }

            jsfeat.cache.put_buffer(sum_node);
            jsfeat.cache.put_buffer(buf_node);
            jsfeat.cache.put_buffer(xofs_node);
        }

        var _resample = function (src, dst, nw, nh) {
            var xofs_count = 0;
            var ch = src.channel, w = src.cols, h = src.rows;
            var src_d = src.data, dst_d = dst.data;
            var scale_x = w / nw, scale_y = h / nh;
            var scale = 1.0 / (scale_x * scale_y);
            var dx = 0, dy = 0, sx = 0, sy = 0, sx1 = 0, sx2 = 0, i = 0, k = 0, fsx1 = 0.0, fsx2 = 0.0;
            var a = 0, b = 0, dxn = 0, alpha = 0.0, beta = 0.0, beta1 = 0.0;

            var buf_node = jsfeat.cache.get_buffer((nw * ch) << 2);
            var sum_node = jsfeat.cache.get_buffer((nw * ch) << 2);
            var xofs_node = jsfeat.cache.get_buffer((w * 2 * 3) << 2);

            var buf = buf_node.f32;
            var sum = sum_node.f32;
            var xofs = xofs_node.f32;

            for (; dx < nw; dx++) {
                fsx1 = dx * scale_x, fsx2 = fsx1 + scale_x;
                sx1 = (fsx1 + 1.0 - 1e-6) | 0, sx2 = fsx2 | 0;
                sx1 = Math.min(sx1, w - 1);
                sx2 = Math.min(sx2, w - 1);

                if (sx1 > fsx1) {
                    xofs_count++;
                    xofs[k++] = ((sx1 - 1) * ch) | 0;
                    xofs[k++] = (dx * ch) | 0;
                    xofs[k++] = (sx1 - fsx1) * scale;
                }
                for (sx = sx1; sx < sx2; sx++) {
                    xofs_count++;
                    xofs[k++] = (sx * ch) | 0;
                    xofs[k++] = (dx * ch) | 0;
                    xofs[k++] = scale;
                }
                if (fsx2 - sx2 > 1e-3) {
                    xofs_count++;
                    xofs[k++] = (sx2 * ch) | 0;
                    xofs[k++] = (dx * ch) | 0;
                    xofs[k++] = (fsx2 - sx2) * scale;
                }
            }

            for (dx = 0; dx < nw * ch; dx++) {
                buf[dx] = sum[dx] = 0;
            }
            dy = 0;
            for (sy = 0; sy < h; sy++) {
                a = w * sy;
                for (k = 0; k < xofs_count; k++) {
                    sx1 = xofs[k * 3] | 0;
                    dxn = xofs[k * 3 + 1] | 0;
                    alpha = xofs[k * 3 + 2];
                    for (i = 0; i < ch; i++) {
                        buf[dxn + i] += src_d[a + sx1 + i] * alpha;
                    }
                }
                if ((dy + 1) * scale_y <= sy + 1 || sy == h - 1) {
                    beta = Math.max(sy + 1 - (dy + 1) * scale_y, 0.0);
                    beta1 = 1.0 - beta;
                    b = nw * dy;
                    if (Math.abs(beta) < 1e-3) {
                        for (dx = 0; dx < nw * ch; dx++) {
                            dst_d[b + dx] = sum[dx] + buf[dx];
                            sum[dx] = buf[dx] = 0;
                        }
                    } else {
                        for (dx = 0; dx < nw * ch; dx++) {
                            dst_d[b + dx] = sum[dx] + buf[dx] * beta1;
                            sum[dx] = buf[dx] * beta;
                            buf[dx] = 0;
                        }
                    }
                    dy++;
                } else {
                    for (dx = 0; dx < nw * ch; dx++) {
                        sum[dx] += buf[dx];
                        buf[dx] = 0;
                    }
                }
            }
            jsfeat.cache.put_buffer(sum_node);
            jsfeat.cache.put_buffer(buf_node);
            jsfeat.cache.put_buffer(xofs_node);
        }

        var _convol_u8 = function (buf, src_d, dst_d, w, h, filter, kernel_size, half_kernel) {
            var i = 0, j = 0, k = 0, sp = 0, dp = 0, sum = 0, sum1 = 0, sum2 = 0, sum3 = 0, f0 = filter[0], fk = 0;
            var w2 = w << 1, w3 = w * 3, w4 = w << 2;
            // hor pass
            for (; i < h; ++i) {
                sum = src_d[sp];
                for (j = 0; j < half_kernel; ++j) {
                    buf[j] = sum;
                }
                for (j = 0; j <= w - 2; j += 2) {
                    buf[j + half_kernel] = src_d[sp + j];
                    buf[j + half_kernel + 1] = src_d[sp + j + 1];
                }
                for (; j < w; ++j) {
                    buf[j + half_kernel] = src_d[sp + j];
                }
                sum = src_d[sp + w - 1];
                for (j = w; j < half_kernel + w; ++j) {
                    buf[j + half_kernel] = sum;
                }
                for (j = 0; j <= w - 4; j += 4) {
                    sum = buf[j] * f0,
                    sum1 = buf[j + 1] * f0,
                    sum2 = buf[j + 2] * f0,
                    sum3 = buf[j + 3] * f0;
                    for (k = 1; k < kernel_size; ++k) {
                        fk = filter[k];
                        sum += buf[k + j] * fk;
                        sum1 += buf[k + j + 1] * fk;
                        sum2 += buf[k + j + 2] * fk;
                        sum3 += buf[k + j + 3] * fk;
                    }
                    dst_d[dp + j] = Math.min(sum >> 8, 255);
                    dst_d[dp + j + 1] = Math.min(sum1 >> 8, 255);
                    dst_d[dp + j + 2] = Math.min(sum2 >> 8, 255);
                    dst_d[dp + j + 3] = Math.min(sum3 >> 8, 255);
                }
                for (; j < w; ++j) {
                    sum = buf[j] * f0;
                    for (k = 1; k < kernel_size; ++k) {
                        sum += buf[k + j] * filter[k];
                    }
                    dst_d[dp + j] = Math.min(sum >> 8, 255);
                }
                sp += w;
                dp += w;
            }

            // vert pass
            for (i = 0; i < w; ++i) {
                sum = dst_d[i];
                for (j = 0; j < half_kernel; ++j) {
                    buf[j] = sum;
                }
                k = i;
                for (j = 0; j <= h - 2; j += 2, k += w2) {
                    buf[j + half_kernel] = dst_d[k];
                    buf[j + half_kernel + 1] = dst_d[k + w];
                }
                for (; j < h; ++j, k += w) {
                    buf[j + half_kernel] = dst_d[k];
                }
                sum = dst_d[(h - 1) * w + i];
                for (j = h; j < half_kernel + h; ++j) {
                    buf[j + half_kernel] = sum;
                }
                dp = i;
                for (j = 0; j <= h - 4; j += 4, dp += w4) {
                    sum = buf[j] * f0,
                    sum1 = buf[j + 1] * f0,
                    sum2 = buf[j + 2] * f0,
                    sum3 = buf[j + 3] * f0;
                    for (k = 1; k < kernel_size; ++k) {
                        fk = filter[k];
                        sum += buf[k + j] * fk;
                        sum1 += buf[k + j + 1] * fk;
                        sum2 += buf[k + j + 2] * fk;
                        sum3 += buf[k + j + 3] * fk;
                    }
                    dst_d[dp] = Math.min(sum >> 8, 255);
                    dst_d[dp + w] = Math.min(sum1 >> 8, 255);
                    dst_d[dp + w2] = Math.min(sum2 >> 8, 255);
                    dst_d[dp + w3] = Math.min(sum3 >> 8, 255);
                }
                for (; j < h; ++j, dp += w) {
                    sum = buf[j] * f0;
                    for (k = 1; k < kernel_size; ++k) {
                        sum += buf[k + j] * filter[k];
                    }
                    dst_d[dp] = Math.min(sum >> 8, 255);
                }
            }
        }

        var _convol = function (buf, src_d, dst_d, w, h, filter, kernel_size, half_kernel) {
            var i = 0, j = 0, k = 0, sp = 0, dp = 0, sum = 0.0, sum1 = 0.0, sum2 = 0.0, sum3 = 0.0, f0 = filter[0], fk = 0.0;
            var w2 = w << 1, w3 = w * 3, w4 = w << 2;
            // hor pass
            for (; i < h; ++i) {
                sum = src_d[sp];
                for (j = 0; j < half_kernel; ++j) {
                    buf[j] = sum;
                }
                for (j = 0; j <= w - 2; j += 2) {
                    buf[j + half_kernel] = src_d[sp + j];
                    buf[j + half_kernel + 1] = src_d[sp + j + 1];
                }
                for (; j < w; ++j) {
                    buf[j + half_kernel] = src_d[sp + j];
                }
                sum = src_d[sp + w - 1];
                for (j = w; j < half_kernel + w; ++j) {
                    buf[j + half_kernel] = sum;
                }
                for (j = 0; j <= w - 4; j += 4) {
                    sum = buf[j] * f0,
                    sum1 = buf[j + 1] * f0,
                    sum2 = buf[j + 2] * f0,
                    sum3 = buf[j + 3] * f0;
                    for (k = 1; k < kernel_size; ++k) {
                        fk = filter[k];
                        sum += buf[k + j] * fk;
                        sum1 += buf[k + j + 1] * fk;
                        sum2 += buf[k + j + 2] * fk;
                        sum3 += buf[k + j + 3] * fk;
                    }
                    dst_d[dp + j] = sum;
                    dst_d[dp + j + 1] = sum1;
                    dst_d[dp + j + 2] = sum2;
                    dst_d[dp + j + 3] = sum3;
                }
                for (; j < w; ++j) {
                    sum = buf[j] * f0;
                    for (k = 1; k < kernel_size; ++k) {
                        sum += buf[k + j] * filter[k];
                    }
                    dst_d[dp + j] = sum;
                }
                sp += w;
                dp += w;
            }

            // vert pass
            for (i = 0; i < w; ++i) {
                sum = dst_d[i];
                for (j = 0; j < half_kernel; ++j) {
                    buf[j] = sum;
                }
                k = i;
                for (j = 0; j <= h - 2; j += 2, k += w2) {
                    buf[j + half_kernel] = dst_d[k];
                    buf[j + half_kernel + 1] = dst_d[k + w];
                }
                for (; j < h; ++j, k += w) {
                    buf[j + half_kernel] = dst_d[k];
                }
                sum = dst_d[(h - 1) * w + i];
                for (j = h; j < half_kernel + h; ++j) {
                    buf[j + half_kernel] = sum;
                }
                dp = i;
                for (j = 0; j <= h - 4; j += 4, dp += w4) {
                    sum = buf[j] * f0,
                    sum1 = buf[j + 1] * f0,
                    sum2 = buf[j + 2] * f0,
                    sum3 = buf[j + 3] * f0;
                    for (k = 1; k < kernel_size; ++k) {
                        fk = filter[k];
                        sum += buf[k + j] * fk;
                        sum1 += buf[k + j + 1] * fk;
                        sum2 += buf[k + j + 2] * fk;
                        sum3 += buf[k + j + 3] * fk;
                    }
                    dst_d[dp] = sum;
                    dst_d[dp + w] = sum1;
                    dst_d[dp + w2] = sum2;
                    dst_d[dp + w3] = sum3;
                }
                for (; j < h; ++j, dp += w) {
                    sum = buf[j] * f0;
                    for (k = 1; k < kernel_size; ++k) {
                        sum += buf[k + j] * filter[k];
                    }
                    dst_d[dp] = sum;
                }
            }
        }

        return {
            // TODO: add support for RGB/BGR order
            // for raw arrays
            grayscale: function (src, w, h, dst, code) {
                // this is default image data representation in browser
                if (typeof code === "undefined") { code = jsfeat.COLOR_RGBA2GRAY; }
                var x = 0, y = 0, i = 0, j = 0, ir = 0, jr = 0;
                var coeff_r = 4899, coeff_g = 9617, coeff_b = 1868, cn = 4;

                if (code == jsfeat.COLOR_BGRA2GRAY || code == jsfeat.COLOR_BGR2GRAY) {
                    coeff_r = 1868;
                    coeff_b = 4899;
                }
                if (code == jsfeat.COLOR_RGB2GRAY || code == jsfeat.COLOR_BGR2GRAY) {
                    cn = 3;
                }
                var cn2 = cn << 1, cn3 = (cn * 3) | 0;

                dst.resize(w, h, 1);
                var dst_u8 = dst.data;

                for (y = 0; y < h; ++y, j += w, i += w * cn) {
                    for (x = 0, ir = i, jr = j; x <= w - 4; x += 4, ir += cn << 2, jr += 4) {
                        dst_u8[jr] = (src[ir] * coeff_r + src[ir + 1] * coeff_g + src[ir + 2] * coeff_b + 8192) >> 14;
                        dst_u8[jr + 1] = (src[ir + cn] * coeff_r + src[ir + cn + 1] * coeff_g + src[ir + cn + 2] * coeff_b + 8192) >> 14;
                        dst_u8[jr + 2] = (src[ir + cn2] * coeff_r + src[ir + cn2 + 1] * coeff_g + src[ir + cn2 + 2] * coeff_b + 8192) >> 14;
                        dst_u8[jr + 3] = (src[ir + cn3] * coeff_r + src[ir + cn3 + 1] * coeff_g + src[ir + cn3 + 2] * coeff_b + 8192) >> 14;
                    }
                    for (; x < w; ++x, ++jr, ir += cn) {
                        dst_u8[jr] = (src[ir] * coeff_r + src[ir + 1] * coeff_g + src[ir + 2] * coeff_b + 8192) >> 14;
                    }
                }
            },
            // derived from CCV library
            resample: function (src, dst, nw, nh) {
                var h = src.rows, w = src.cols;
                if (h > nh && w > nw) {
                    dst.resize(nw, nh, src.channel);
                    // using the fast alternative (fix point scale, 0x100 to avoid overflow)
                    if (src.type & jsfeat.U8_t && dst.type & jsfeat.U8_t && h * w / (nh * nw) < 0x100) {
                        _resample_u8(src, dst, nw, nh);
                    } else {
                        _resample(src, dst, nw, nh);
                    }
                }
            },

            box_blur_gray: function (src, dst, radius, options) {
                if (typeof options === "undefined") { options = 0; }
                var w = src.cols, h = src.rows, h2 = h << 1, w2 = w << 1;
                var i = 0, x = 0, y = 0, end = 0;
                var windowSize = ((radius << 1) + 1) | 0;
                var radiusPlusOne = (radius + 1) | 0, radiusPlus2 = (radiusPlusOne + 1) | 0;
                var scale = options & jsfeat.BOX_BLUR_NOSCALE ? 1 : (1.0 / (windowSize * windowSize));

                var tmp_buff = jsfeat.cache.get_buffer((w * h) << 2);

                var sum = 0, dstIndex = 0, srcIndex = 0, nextPixelIndex = 0, previousPixelIndex = 0;
                var data_i32 = tmp_buff.i32; // to prevent overflow
                var data_u8 = src.data;
                var hold = 0;

                dst.resize(w, h, src.channel);

                // first pass
                // no need to scale 
                //data_u8 = src.data;
                //data_i32 = tmp;
                for (y = 0; y < h; ++y) {
                    dstIndex = y;
                    sum = radiusPlusOne * data_u8[srcIndex];

                    for (i = (srcIndex + 1) | 0, end = (srcIndex + radius) | 0; i <= end; ++i) {
                        sum += data_u8[i];
                    }

                    nextPixelIndex = (srcIndex + radiusPlusOne) | 0;
                    previousPixelIndex = srcIndex;
                    hold = data_u8[previousPixelIndex];
                    for (x = 0; x < radius; ++x, dstIndex += h) {
                        data_i32[dstIndex] = sum;
                        sum += data_u8[nextPixelIndex] - hold;
                        nextPixelIndex++;
                    }
                    for (; x < w - radiusPlus2; x += 2, dstIndex += h2) {
                        data_i32[dstIndex] = sum;
                        sum += data_u8[nextPixelIndex] - data_u8[previousPixelIndex];

                        data_i32[dstIndex + h] = sum;
                        sum += data_u8[nextPixelIndex + 1] - data_u8[previousPixelIndex + 1];

                        nextPixelIndex += 2;
                        previousPixelIndex += 2;
                    }
                    for (; x < w - radiusPlusOne; ++x, dstIndex += h) {
                        data_i32[dstIndex] = sum;
                        sum += data_u8[nextPixelIndex] - data_u8[previousPixelIndex];

                        nextPixelIndex++;
                        previousPixelIndex++;
                    }

                    hold = data_u8[nextPixelIndex - 1];
                    for (; x < w; ++x, dstIndex += h) {
                        data_i32[dstIndex] = sum;

                        sum += hold - data_u8[previousPixelIndex];
                        previousPixelIndex++;
                    }

                    srcIndex += w;
                }
                //
                // second pass
                srcIndex = 0;
                //data_i32 = tmp; // this is a transpose
                data_u8 = dst.data;

                // dont scale result
                if (scale == 1) {
                    for (y = 0; y < w; ++y) {
                        dstIndex = y;
                        sum = radiusPlusOne * data_i32[srcIndex];

                        for (i = (srcIndex + 1) | 0, end = (srcIndex + radius) | 0; i <= end; ++i) {
                            sum += data_i32[i];
                        }

                        nextPixelIndex = srcIndex + radiusPlusOne;
                        previousPixelIndex = srcIndex;
                        hold = data_i32[previousPixelIndex];

                        for (x = 0; x < radius; ++x, dstIndex += w) {
                            data_u8[dstIndex] = sum;
                            sum += data_i32[nextPixelIndex] - hold;
                            nextPixelIndex++;
                        }
                        for (; x < h - radiusPlus2; x += 2, dstIndex += w2) {
                            data_u8[dstIndex] = sum;
                            sum += data_i32[nextPixelIndex] - data_i32[previousPixelIndex];

                            data_u8[dstIndex + w] = sum;
                            sum += data_i32[nextPixelIndex + 1] - data_i32[previousPixelIndex + 1];

                            nextPixelIndex += 2;
                            previousPixelIndex += 2;
                        }
                        for (; x < h - radiusPlusOne; ++x, dstIndex += w) {
                            data_u8[dstIndex] = sum;

                            sum += data_i32[nextPixelIndex] - data_i32[previousPixelIndex];
                            nextPixelIndex++;
                            previousPixelIndex++;
                        }
                        hold = data_i32[nextPixelIndex - 1];
                        for (; x < h; ++x, dstIndex += w) {
                            data_u8[dstIndex] = sum;

                            sum += hold - data_i32[previousPixelIndex];
                            previousPixelIndex++;
                        }

                        srcIndex += h;
                    }
                } else {
                    for (y = 0; y < w; ++y) {
                        dstIndex = y;
                        sum = radiusPlusOne * data_i32[srcIndex];

                        for (i = (srcIndex + 1) | 0, end = (srcIndex + radius) | 0; i <= end; ++i) {
                            sum += data_i32[i];
                        }

                        nextPixelIndex = srcIndex + radiusPlusOne;
                        previousPixelIndex = srcIndex;
                        hold = data_i32[previousPixelIndex];

                        for (x = 0; x < radius; ++x, dstIndex += w) {
                            data_u8[dstIndex] = sum * scale;
                            sum += data_i32[nextPixelIndex] - hold;
                            nextPixelIndex++;
                        }
                        for (; x < h - radiusPlus2; x += 2, dstIndex += w2) {
                            data_u8[dstIndex] = sum * scale;
                            sum += data_i32[nextPixelIndex] - data_i32[previousPixelIndex];

                            data_u8[dstIndex + w] = sum * scale;
                            sum += data_i32[nextPixelIndex + 1] - data_i32[previousPixelIndex + 1];

                            nextPixelIndex += 2;
                            previousPixelIndex += 2;
                        }
                        for (; x < h - radiusPlusOne; ++x, dstIndex += w) {
                            data_u8[dstIndex] = sum * scale;

                            sum += data_i32[nextPixelIndex] - data_i32[previousPixelIndex];
                            nextPixelIndex++;
                            previousPixelIndex++;
                        }
                        hold = data_i32[nextPixelIndex - 1];
                        for (; x < h; ++x, dstIndex += w) {
                            data_u8[dstIndex] = sum * scale;

                            sum += hold - data_i32[previousPixelIndex];
                            previousPixelIndex++;
                        }

                        srcIndex += h;
                    }
                }

                jsfeat.cache.put_buffer(tmp_buff);
            },

            gaussian_blur: function (src, dst, kernel_size, sigma) {
                if (typeof sigma === "undefined") { sigma = 0.0; }
                if (typeof kernel_size === "undefined") { kernel_size = 0; }
                kernel_size = kernel_size == 0 ? (Math.max(1, (4.0 * sigma + 1.0 - 1e-8)) * 2 + 1) | 0 : kernel_size;
                var half_kernel = kernel_size >> 1;
                var w = src.cols, h = src.rows;
                var data_type = src.type, is_u8 = data_type & jsfeat.U8_t;

                dst.resize(w, h, src.channel);

                var src_d = src.data, dst_d = dst.data;
                var buf, filter, buf_sz = (kernel_size + Math.max(h, w)) | 0;

                var buf_node = jsfeat.cache.get_buffer(buf_sz << 2);
                var filt_node = jsfeat.cache.get_buffer(kernel_size << 2);

                if (is_u8) {
                    buf = buf_node.i32;
                    filter = filt_node.i32;
                } else if (data_type & jsfeat.S32_t) {
                    buf = buf_node.i32;
                    filter = filt_node.f32;
                } else {
                    buf = buf_node.f32;
                    filter = filt_node.f32;
                }

                jsfeat.math.get_gaussian_kernel(kernel_size, sigma, filter, data_type);

                if (is_u8) {
                    _convol_u8(buf, src_d, dst_d, w, h, filter, kernel_size, half_kernel);
                } else {
                    _convol(buf, src_d, dst_d, w, h, filter, kernel_size, half_kernel);
                }

                jsfeat.cache.put_buffer(buf_node);
                jsfeat.cache.put_buffer(filt_node);
            },
            // assume we always need it for u8 image
            pyrdown: function (src, dst, sx, sy) {
                // this is needed for bbf
                if (typeof sx === "undefined") { sx = 0; }
                if (typeof sy === "undefined") { sy = 0; }

                var w = src.cols, h = src.rows;
                var w2 = w >> 1, h2 = h >> 1;
                var _w2 = w2 - (sx << 1), _h2 = h2 - (sy << 1);
                var x = 0, y = 0, sptr = sx + sy * w, sline = 0, dptr = 0, dline = 0;

                dst.resize(w2, h2, src.channel);

                var src_d = src.data, dst_d = dst.data;

                for (y = 0; y < _h2; ++y) {
                    sline = sptr;
                    dline = dptr;
                    for (x = 0; x <= _w2 - 2; x += 2, dline += 2, sline += 4) {
                        dst_d[dline] = (src_d[sline] + src_d[sline + 1] +
                                            src_d[sline + w] + src_d[sline + w + 1] + 2) >> 2;
                        dst_d[dline + 1] = (src_d[sline + 2] + src_d[sline + 3] +
                                            src_d[sline + w + 2] + src_d[sline + w + 3] + 2) >> 2;
                    }
                    for (; x < _w2; ++x, ++dline, sline += 2) {
                        dst_d[dline] = (src_d[sline] + src_d[sline + 1] +
                                            src_d[sline + w] + src_d[sline + w + 1] + 2) >> 2;
                    }
                    sptr += w << 1;
                    dptr += w2;
                }
            },

            // dst: [gx,gy,...]
            scharr_derivatives: function (src, dst) {
                var w = src.cols, h = src.rows;
                var dstep = w << 1, x = 0, y = 0, x1 = 0, a, b, c, d, e, f;
                var srow0 = 0, srow1 = 0, srow2 = 0, drow = 0;
                var trow0, trow1;

                dst.resize(w, h, 2); // 2 channel output gx, gy

                var img = src.data, gxgy = dst.data;

                var buf0_node = jsfeat.cache.get_buffer((w + 2) << 2);
                var buf1_node = jsfeat.cache.get_buffer((w + 2) << 2);

                if (src.type & jsfeat.U8_t || src.type & jsfeat.S32_t) {
                    trow0 = buf0_node.i32;
                    trow1 = buf1_node.i32;
                } else {
                    trow0 = buf0_node.f32;
                    trow1 = buf1_node.f32;
                }

                for (; y < h; ++y, srow1 += w) {
                    srow0 = ((y > 0 ? y - 1 : 1) * w) | 0;
                    srow2 = ((y < h - 1 ? y + 1 : h - 2) * w) | 0;
                    drow = (y * dstep) | 0;
                    // do vertical convolution
                    for (x = 0, x1 = 1; x <= w - 2; x += 2, x1 += 2) {
                        a = img[srow0 + x], b = img[srow2 + x];
                        trow0[x1] = ((a + b) * 3 + (img[srow1 + x]) * 10);
                        trow1[x1] = (b - a);
                        //
                        a = img[srow0 + x + 1], b = img[srow2 + x + 1];
                        trow0[x1 + 1] = ((a + b) * 3 + (img[srow1 + x + 1]) * 10);
                        trow1[x1 + 1] = (b - a);
                    }
                    for (; x < w; ++x, ++x1) {
                        a = img[srow0 + x], b = img[srow2 + x];
                        trow0[x1] = ((a + b) * 3 + (img[srow1 + x]) * 10);
                        trow1[x1] = (b - a);
                    }
                    // make border
                    x = (w + 1) | 0;
                    trow0[0] = trow0[1]; trow0[x] = trow0[w];
                    trow1[0] = trow1[1]; trow1[x] = trow1[w];
                    // do horizontal convolution, interleave the results and store them
                    for (x = 0; x <= w - 4; x += 4) {
                        a = trow1[x + 2], b = trow1[x + 1], c = trow1[x + 3], d = trow1[x + 4],
                        e = trow0[x + 2], f = trow0[x + 3];
                        gxgy[drow++] = (e - trow0[x]);
                        gxgy[drow++] = ((a + trow1[x]) * 3 + b * 10);
                        gxgy[drow++] = (f - trow0[x + 1]);
                        gxgy[drow++] = ((c + b) * 3 + a * 10);

                        gxgy[drow++] = ((trow0[x + 4] - e));
                        gxgy[drow++] = (((d + a) * 3 + c * 10));
                        gxgy[drow++] = ((trow0[x + 5] - f));
                        gxgy[drow++] = (((trow1[x + 5] + c) * 3 + d * 10));
                    }
                    for (; x < w; ++x) {
                        gxgy[drow++] = ((trow0[x + 2] - trow0[x]));
                        gxgy[drow++] = (((trow1[x + 2] + trow1[x]) * 3 + trow1[x + 1] * 10));
                    }
                }
                jsfeat.cache.put_buffer(buf0_node);
                jsfeat.cache.put_buffer(buf1_node);
            },

            // compute gradient using Sobel kernel [1 2 1] * [-1 0 1]^T
            // dst: [gx,gy,...]
            sobel_derivatives: function (src, dst) {
                var w = src.cols, h = src.rows;
                var dstep = w << 1, x = 0, y = 0, x1 = 0, a, b, c, d, e, f;
                var srow0 = 0, srow1 = 0, srow2 = 0, drow = 0;
                var trow0, trow1;

                dst.resize(w, h, 2); // 2 channel output gx, gy

                var img = src.data, gxgy = dst.data;

                var buf0_node = jsfeat.cache.get_buffer((w + 2) << 2);
                var buf1_node = jsfeat.cache.get_buffer((w + 2) << 2);

                if (src.type & jsfeat.U8_t || src.type & jsfeat.S32_t) {
                    trow0 = buf0_node.i32;
                    trow1 = buf1_node.i32;
                } else {
                    trow0 = buf0_node.f32;
                    trow1 = buf1_node.f32;
                }

                for (; y < h; ++y, srow1 += w) {
                    srow0 = ((y > 0 ? y - 1 : 1) * w) | 0;
                    srow2 = ((y < h - 1 ? y + 1 : h - 2) * w) | 0;
                    drow = (y * dstep) | 0;
                    // do vertical convolution
                    for (x = 0, x1 = 1; x <= w - 2; x += 2, x1 += 2) {
                        a = img[srow0 + x], b = img[srow2 + x];
                        trow0[x1] = ((a + b) + (img[srow1 + x] * 2));
                        trow1[x1] = (b - a);
                        //
                        a = img[srow0 + x + 1], b = img[srow2 + x + 1];
                        trow0[x1 + 1] = ((a + b) + (img[srow1 + x + 1] * 2));
                        trow1[x1 + 1] = (b - a);
                    }
                    for (; x < w; ++x, ++x1) {
                        a = img[srow0 + x], b = img[srow2 + x];
                        trow0[x1] = ((a + b) + (img[srow1 + x] * 2));
                        trow1[x1] = (b - a);
                    }
                    // make border
                    x = (w + 1) | 0;
                    trow0[0] = trow0[1]; trow0[x] = trow0[w];
                    trow1[0] = trow1[1]; trow1[x] = trow1[w];
                    // do horizontal convolution, interleave the results and store them
                    for (x = 0; x <= w - 4; x += 4) {
                        a = trow1[x + 2], b = trow1[x + 1], c = trow1[x + 3], d = trow1[x + 4],
                        e = trow0[x + 2], f = trow0[x + 3];
                        gxgy[drow++] = (e - trow0[x]);
                        gxgy[drow++] = (a + trow1[x] + b * 2);
                        gxgy[drow++] = (f - trow0[x + 1]);
                        gxgy[drow++] = (c + b + a * 2);

                        gxgy[drow++] = (trow0[x + 4] - e);
                        gxgy[drow++] = (d + a + c * 2);
                        gxgy[drow++] = (trow0[x + 5] - f);
                        gxgy[drow++] = (trow1[x + 5] + c + d * 2);
                    }
                    for (; x < w; ++x) {
                        gxgy[drow++] = (trow0[x + 2] - trow0[x]);
                        gxgy[drow++] = (trow1[x + 2] + trow1[x] + trow1[x + 1] * 2);
                    }
                }
                jsfeat.cache.put_buffer(buf0_node);
                jsfeat.cache.put_buffer(buf1_node);
            },

            // please note: 
            // dst_(type) size should be cols = src.cols+1, rows = src.rows+1
            compute_integral_image: function (src, dst_sum, dst_sqsum, dst_tilted) {
                var w0 = src.cols | 0, h0 = src.rows | 0, src_d = src.data;
                var w1 = (w0 + 1) | 0;
                var s = 0, s2 = 0, p = 0, pup = 0, i = 0, j = 0, v = 0, k = 0;

                if (dst_sum && dst_sqsum) {
                    // fill first row with zeros
                    for (; i < w1; ++i) {
                        dst_sum[i] = 0, dst_sqsum[i] = 0;
                    }
                    p = (w1 + 1) | 0, pup = 1;
                    for (i = 0, k = 0; i < h0; ++i, ++p, ++pup) {
                        s = s2 = 0;
                        for (j = 0; j <= w0 - 2; j += 2, k += 2, p += 2, pup += 2) {
                            v = src_d[k];
                            s += v, s2 += v * v;
                            dst_sum[p] = dst_sum[pup] + s;
                            dst_sqsum[p] = dst_sqsum[pup] + s2;

                            v = src_d[k + 1];
                            s += v, s2 += v * v;
                            dst_sum[p + 1] = dst_sum[pup + 1] + s;
                            dst_sqsum[p + 1] = dst_sqsum[pup + 1] + s2;
                        }
                        for (; j < w0; ++j, ++k, ++p, ++pup) {
                            v = src_d[k];
                            s += v, s2 += v * v;
                            dst_sum[p] = dst_sum[pup] + s;
                            dst_sqsum[p] = dst_sqsum[pup] + s2;
                        }
                    }
                } else if (dst_sum) {
                    // fill first row with zeros
                    for (; i < w1; ++i) {
                        dst_sum[i] = 0;
                    }
                    p = (w1 + 1) | 0, pup = 1;
                    for (i = 0, k = 0; i < h0; ++i, ++p, ++pup) {
                        s = 0;
                        for (j = 0; j <= w0 - 2; j += 2, k += 2, p += 2, pup += 2) {
                            s += src_d[k];
                            dst_sum[p] = dst_sum[pup] + s;
                            s += src_d[k + 1];
                            dst_sum[p + 1] = dst_sum[pup + 1] + s;
                        }
                        for (; j < w0; ++j, ++k, ++p, ++pup) {
                            s += src_d[k];
                            dst_sum[p] = dst_sum[pup] + s;
                        }
                    }
                } else if (dst_sqsum) {
                    // fill first row with zeros
                    for (; i < w1; ++i) {
                        dst_sqsum[i] = 0;
                    }
                    p = (w1 + 1) | 0, pup = 1;
                    for (i = 0, k = 0; i < h0; ++i, ++p, ++pup) {
                        s2 = 0;
                        for (j = 0; j <= w0 - 2; j += 2, k += 2, p += 2, pup += 2) {
                            v = src_d[k];
                            s2 += v * v;
                            dst_sqsum[p] = dst_sqsum[pup] + s2;
                            v = src_d[k + 1];
                            s2 += v * v;
                            dst_sqsum[p + 1] = dst_sqsum[pup + 1] + s2;
                        }
                        for (; j < w0; ++j, ++k, ++p, ++pup) {
                            v = src_d[k];
                            s2 += v * v;
                            dst_sqsum[p] = dst_sqsum[pup] + s2;
                        }
                    }
                }

                if (dst_tilted) {
                    // fill first row with zeros
                    for (i = 0; i < w1; ++i) {
                        dst_tilted[i] = 0;
                    }
                    // diagonal
                    p = (w1 + 1) | 0, pup = 0;
                    for (i = 0, k = 0; i < h0; ++i, ++p, ++pup) {
                        for (j = 0; j <= w0 - 2; j += 2, k += 2, p += 2, pup += 2) {
                            dst_tilted[p] = src_d[k] + dst_tilted[pup];
                            dst_tilted[p + 1] = src_d[k + 1] + dst_tilted[pup + 1];
                        }
                        for (; j < w0; ++j, ++k, ++p, ++pup) {
                            dst_tilted[p] = src_d[k] + dst_tilted[pup];
                        }
                    }
                    // diagonal
                    p = (w1 + w0) | 0, pup = w0;
                    for (i = 0; i < h0; ++i, p += w1, pup += w1) {
                        dst_tilted[p] += dst_tilted[pup];
                    }

                    for (j = w0 - 1; j > 0; --j) {
                        p = j + h0 * w1, pup = p - w1;
                        for (i = h0; i > 0; --i, p -= w1, pup -= w1) {
                            dst_tilted[p] += dst_tilted[pup] + dst_tilted[pup + 1];
                        }
                    }
                }
            },
            equalize_histogram: function (src, dst) {
                var w = src.cols, h = src.rows, src_d = src.data;

                dst.resize(w, h, src.channel);

                var dst_d = dst.data, size = w * h;
                var i = 0, prev = 0, hist0, norm;

                var hist0_node = jsfeat.cache.get_buffer(256 << 2);
                hist0 = hist0_node.i32;
                for (; i < 256; ++i) hist0[i] = 0;
                for (i = 0; i < size; ++i) {
                    ++hist0[src_d[i]];
                }

                prev = hist0[0];
                for (i = 1; i < 256; ++i) {
                    prev = hist0[i] += prev;
                }

                norm = 255 / size;
                for (i = 0; i < size; ++i) {
                    dst_d[i] = (hist0[src_d[i]] * norm + 0.5) | 0;
                }
                jsfeat.cache.put_buffer(hist0_node);
            },

            canny: function (src, dst, low_thresh, high_thresh) {
                var w = src.cols, h = src.rows, src_d = src.data;

                dst.resize(w, h, src.channel);

                var dst_d = dst.data;
                var i = 0, j = 0, grad = 0, w2 = w << 1, _grad = 0, suppress = 0, f = 0, x = 0, y = 0, s = 0;
                var tg22x = 0, tg67x = 0;

                // cache buffers
                var dxdy_node = jsfeat.cache.get_buffer((h * w2) << 2);
                var buf_node = jsfeat.cache.get_buffer((3 * (w + 2)) << 2);
                var map_node = jsfeat.cache.get_buffer(((h + 2) * (w + 2)) << 2);
                var stack_node = jsfeat.cache.get_buffer((h * w) << 2);


                var buf = buf_node.i32;
                var map = map_node.i32;
                var stack = stack_node.i32;
                var dxdy = dxdy_node.i32;
                var dxdy_m = new jsfeat.matrix_t(w, h, jsfeat.S32C2_t, dxdy_node.data);
                var row0 = 1, row1 = (w + 2 + 1) | 0, row2 = (2 * (w + 2) + 1) | 0, map_w = (w + 2) | 0, map_i = (map_w + 1) | 0, stack_i = 0;

                this.sobel_derivatives(src, dxdy_m);

                if (low_thresh > high_thresh) {
                    i = low_thresh;
                    low_thresh = high_thresh;
                    high_thresh = i;
                }

                i = (3 * (w + 2)) | 0;
                while (--i >= 0) {
                    buf[i] = 0;
                }

                i = ((h + 2) * (w + 2)) | 0;
                while (--i >= 0) {
                    map[i] = 0;
                }

                for (; j < w; ++j, grad += 2) {
                    //buf[row1+j] = Math.abs(dxdy[grad]) + Math.abs(dxdy[grad+1]);
                    x = dxdy[grad], y = dxdy[grad + 1];
                    //buf[row1+j] = x*x + y*y;
                    buf[row1 + j] = ((x ^ (x >> 31)) - (x >> 31)) + ((y ^ (y >> 31)) - (y >> 31));
                }

                for (i = 1; i <= h; ++i, grad += w2) {
                    if (i == h) {
                        j = row2 + w;
                        while (--j >= row2) {
                            buf[j] = 0;
                        }
                    } else {
                        for (j = 0; j < w; j++) {
                            //buf[row2+j] =  Math.abs(dxdy[grad+(j<<1)]) + Math.abs(dxdy[grad+(j<<1)+1]);
                            x = dxdy[grad + (j << 1)], y = dxdy[grad + (j << 1) + 1];
                            //buf[row2+j] = x*x + y*y;
                            buf[row2 + j] = ((x ^ (x >> 31)) - (x >> 31)) + ((y ^ (y >> 31)) - (y >> 31));
                        }
                    }
                    _grad = (grad - w2) | 0;
                    map[map_i - 1] = 0;
                    suppress = 0;
                    for (j = 0; j < w; ++j, _grad += 2) {
                        f = buf[row1 + j];
                        if (f > low_thresh) {
                            x = dxdy[_grad];
                            y = dxdy[_grad + 1];
                            s = x ^ y;
                            // seems ot be faster than Math.abs
                            x = ((x ^ (x >> 31)) - (x >> 31)) | 0;
                            y = ((y ^ (y >> 31)) - (y >> 31)) | 0;
                            //x * tan(22.5) x * tan(67.5) == 2 * x + x * tan(22.5)
                            tg22x = x * 13573;
                            tg67x = tg22x + ((x + x) << 15);
                            y <<= 15;
                            if (y < tg22x) {
                                if (f > buf[row1 + j - 1] && f >= buf[row1 + j + 1]) {
                                    if (f > high_thresh && !suppress && map[map_i + j - map_w] != 2) {
                                        map[map_i + j] = 2;
                                        suppress = 1;
                                        stack[stack_i++] = map_i + j;
                                    } else {
                                        map[map_i + j] = 1;
                                    }
                                    continue;
                                }
                            } else if (y > tg67x) {
                                if (f > buf[row0 + j] && f >= buf[row2 + j]) {
                                    if (f > high_thresh && !suppress && map[map_i + j - map_w] != 2) {
                                        map[map_i + j] = 2;
                                        suppress = 1;
                                        stack[stack_i++] = map_i + j;
                                    } else {
                                        map[map_i + j] = 1;
                                    }
                                    continue;
                                }
                            } else {
                                s = s < 0 ? -1 : 1;
                                if (f > buf[row0 + j - s] && f > buf[row2 + j + s]) {
                                    if (f > high_thresh && !suppress && map[map_i + j - map_w] != 2) {
                                        map[map_i + j] = 2;
                                        suppress = 1;
                                        stack[stack_i++] = map_i + j;
                                    } else {
                                        map[map_i + j] = 1;
                                    }
                                    continue;
                                }
                            }
                        }
                        map[map_i + j] = 0;
                        suppress = 0;
                    }
                    map[map_i + w] = 0;
                    map_i += map_w;
                    j = row0;
                    row0 = row1;
                    row1 = row2;
                    row2 = j;
                }

                j = map_i - map_w - 1;
                for (i = 0; i < map_w; ++i, ++j) {
                    map[j] = 0;
                }
                // path following
                while (stack_i > 0) {
                    map_i = stack[--stack_i];
                    map_i -= map_w + 1;
                    if (map[map_i] == 1) map[map_i] = 2, stack[stack_i++] = map_i;
                    map_i += 1;
                    if (map[map_i] == 1) map[map_i] = 2, stack[stack_i++] = map_i;
                    map_i += 1;
                    if (map[map_i] == 1) map[map_i] = 2, stack[stack_i++] = map_i;
                    map_i += map_w;
                    if (map[map_i] == 1) map[map_i] = 2, stack[stack_i++] = map_i;
                    map_i -= 2;
                    if (map[map_i] == 1) map[map_i] = 2, stack[stack_i++] = map_i;
                    map_i += map_w;
                    if (map[map_i] == 1) map[map_i] = 2, stack[stack_i++] = map_i;
                    map_i += 1;
                    if (map[map_i] == 1) map[map_i] = 2, stack[stack_i++] = map_i;
                    map_i += 1;
                    if (map[map_i] == 1) map[map_i] = 2, stack[stack_i++] = map_i;
                }

                map_i = map_w + 1;
                row0 = 0;
                for (i = 0; i < h; ++i, map_i += map_w) {
                    for (j = 0; j < w; ++j) {
                        dst_d[row0++] = (map[map_i + j] == 2) * 0xff;
                    }
                }

                // free buffers
                jsfeat.cache.put_buffer(dxdy_node);
                jsfeat.cache.put_buffer(buf_node);
                jsfeat.cache.put_buffer(map_node);
                jsfeat.cache.put_buffer(stack_node);
            },
            // transform is 3x3 matrix_t
            warp_perspective: function (src, dst, transform, fill_value) {
                if (typeof fill_value === "undefined") { fill_value = 0; }
                var src_width = src.cols | 0, src_height = src.rows | 0, dst_width = dst.cols | 0, dst_height = dst.rows | 0;
                var src_d = src.data, dst_d = dst.data;
                var x = 0, y = 0, off = 0, ixs = 0, iys = 0, xs = 0.0, ys = 0.0, xs0 = 0.0, ys0 = 0.0, ws = 0.0, sc = 0.0, a = 0.0, b = 0.0, p0 = 0.0, p1 = 0.0;
                var td = transform.data;
                var m00 = td[0], m01 = td[1], m02 = td[2],
                    m10 = td[3], m11 = td[4], m12 = td[5],
                    m20 = td[6], m21 = td[7], m22 = td[8];

                for (var dptr = 0; y < dst_height; ++y) {
                    xs0 = m01 * y + m02,
                    ys0 = m11 * y + m12,
                    ws = m21 * y + m22;
                    for (x = 0; x < dst_width; ++x, ++dptr, xs0 += m00, ys0 += m10, ws += m20) {
                        sc = 1.0 / ws;
                        xs = xs0 * sc, ys = ys0 * sc;
                        ixs = xs | 0, iys = ys | 0;

                        if (xs > 0 && ys > 0 && ixs < (src_width - 1) && iys < (src_height - 1)) {
                            a = Math.max(xs - ixs, 0.0);
                            b = Math.max(ys - iys, 0.0);
                            off = (src_width * iys + ixs) | 0;

                            p0 = src_d[off] + a * (src_d[off + 1] - src_d[off]);
                            p1 = src_d[off + src_width] + a * (src_d[off + src_width + 1] - src_d[off + src_width]);

                            dst_d[dptr] = p0 + b * (p1 - p0);
                        }
                        else dst_d[dptr] = fill_value;
                    }
                }
            },
            // transform is 3x3 or 2x3 matrix_t only first 6 values referenced
            warp_affine: function (src, dst, transform, fill_value) {
                if (typeof fill_value === "undefined") { fill_value = 0; }
                var src_width = src.cols, src_height = src.rows, dst_width = dst.cols, dst_height = dst.rows;
                var src_d = src.data, dst_d = dst.data;
                var x = 0, y = 0, off = 0, ixs = 0, iys = 0, xs = 0.0, ys = 0.0, a = 0.0, b = 0.0, p0 = 0.0, p1 = 0.0;
                var td = transform.data;
                var m00 = td[0], m01 = td[1], m02 = td[2],
                    m10 = td[3], m11 = td[4], m12 = td[5];

                for (var dptr = 0; y < dst_height; ++y) {
                    xs = m01 * y + m02;
                    ys = m11 * y + m12;
                    for (x = 0; x < dst_width; ++x, ++dptr, xs += m00, ys += m10) {
                        ixs = xs | 0; iys = ys | 0;

                        if (ixs >= 0 && iys >= 0 && ixs < (src_width - 1) && iys < (src_height - 1)) {
                            a = xs - ixs;
                            b = ys - iys;
                            off = src_width * iys + ixs;

                            p0 = src_d[off] + a * (src_d[off + 1] - src_d[off]);
                            p1 = src_d[off + src_width] + a * (src_d[off + src_width + 1] - src_d[off + src_width]);

                            dst_d[dptr] = p0 + b * (p1 - p0);
                        }
                        else dst_d[dptr] = fill_value;
                    }
                }
            },

            // Basic RGB Skin detection filter
            // from http://popscan.blogspot.fr/2012/08/skin-detection-in-digital-images.html
            skindetector: function (src, dst) {
                var r, g, b, j;
                var i = src.width * src.height;
                while (i--) {
                    j = i * 4;
                    r = src.data[j];
                    g = src.data[j + 1];
                    b = src.data[j + 2];
                    if ((r > 95) && (g > 40) && (b > 20)
                     && (r > g) && (r > b)
                     && (r - Math.min(g, b) > 15)
                     && (Math.abs(r - g) > 15)) {
                        dst[i] = 255;
                    } else {
                        dst[i] = 0;
                    }
                }
            }
        };
    })();

    global.imgproc = imgproc;

})(jsfeat);
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 *
 * This is FAST corner detector, contributed to OpenCV by the author, Edward Rosten.
 */

/*
The references are:
 * Machine learning for high-speed corner detection,
   E. Rosten and T. Drummond, ECCV 2006
 * Faster and better: A machine learning approach to corner detection
   E. Rosten, R. Porter and T. Drummond, PAMI, 2009  
*/

(function (global) {
    "use strict";

    //
    var fast_corners = (function () {

        var offsets16 = new Int32Array([0, 3, 1, 3, 2, 2, 3, 1, 3, 0, 3, -1, 2, -2, 1, -3, 0, -3, -1, -3, -2, -2, -3, -1, -3, 0, -3, 1, -2, 2, -1, 3]);

        var threshold_tab = new Uint8Array(512);
        var pixel_off = new Int32Array(25);
        var score_diff = new Int32Array(25);

        // private functions
        var _cmp_offsets = function (pixel, step, pattern_size) {
            var k = 0;
            var offsets = offsets16;
            for (; k < pattern_size; ++k) {
                pixel[k] = offsets[k << 1] + offsets[(k << 1) + 1] * step;
            }
            for (; k < 25; ++k) {
                pixel[k] = pixel[k - pattern_size];
            }
        },

        _cmp_score_16 = function (src, off, pixel, d, threshold) {
            var N = 25, k = 0, v = src[off];
            var a0 = threshold, a = 0, b0 = 0, b = 0;

            for (; k < N; ++k) {
                d[k] = v - src[off + pixel[k]];
            }

            for (k = 0; k < 16; k += 2) {
                a = Math.min(d[k + 1], d[k + 2]);
                a = Math.min(a, d[k + 3]);

                if (a <= a0) continue;

                a = Math.min(a, d[k + 4]);
                a = Math.min(a, d[k + 5]);
                a = Math.min(a, d[k + 6]);
                a = Math.min(a, d[k + 7]);
                a = Math.min(a, d[k + 8]);
                a0 = Math.max(a0, Math.min(a, d[k]));
                a0 = Math.max(a0, Math.min(a, d[k + 9]));
            }

            b0 = -a0;
            for (k = 0; k < 16; k += 2) {
                b = Math.max(d[k + 1], d[k + 2]);
                b = Math.max(b, d[k + 3]);
                b = Math.max(b, d[k + 4]);
                b = Math.max(b, d[k + 5]);

                if (b >= b0) continue;
                b = Math.max(b, d[k + 6]);
                b = Math.max(b, d[k + 7]);
                b = Math.max(b, d[k + 8]);
                b0 = Math.min(b0, Math.max(b, d[k]));
                b0 = Math.min(b0, Math.max(b, d[k + 9]));
            }

            return -b0 - 1;
        };

        var _threshold = 20;

        return {
            set_threshold: function (threshold) {
                _threshold = Math.min(Math.max(threshold, 0), 255);
                for (var i = -255; i <= 255; ++i) {
                    threshold_tab[(i + 255)] = (i < -_threshold ? 1 : (i > _threshold ? 2 : 0));
                }
                return _threshold;
            },

            detect: function (src, corners, border) {
                if (typeof border === "undefined") { border = 3; }

                var K = 8, N = 25;
                var img = src.data, w = src.cols, h = src.rows;
                var i = 0, j = 0, k = 0, vt = 0, x = 0, m3 = 0;
                var buf_node = jsfeat.cache.get_buffer(3 * w);
                var cpbuf_node = jsfeat.cache.get_buffer(((w + 1) * 3) << 2);
                var buf = buf_node.u8;
                var cpbuf = cpbuf_node.i32;
                var pixel = pixel_off;
                var sd = score_diff;
                var sy = Math.max(3, border);
                var ey = Math.min((h - 2), (h - border));
                var sx = Math.max(3, border);
                var ex = Math.min((w - 3), (w - border));
                var _count = 0, corners_cnt = 0, pt;
                var score_func = _cmp_score_16;
                var thresh_tab = threshold_tab;
                var threshold = _threshold;

                var v = 0, tab = 0, d = 0, ncorners = 0, cornerpos = 0, curr = 0, ptr = 0, prev = 0, pprev = 0;
                var jp1 = 0, jm1 = 0, score = 0;

                _cmp_offsets(pixel, w, 16);

                // local vars are faster?
                var pixel0 = pixel[0];
                var pixel1 = pixel[1];
                var pixel2 = pixel[2];
                var pixel3 = pixel[3];
                var pixel4 = pixel[4];
                var pixel5 = pixel[5];
                var pixel6 = pixel[6];
                var pixel7 = pixel[7];
                var pixel8 = pixel[8];
                var pixel9 = pixel[9];
                var pixel10 = pixel[10];
                var pixel11 = pixel[11];
                var pixel12 = pixel[12];
                var pixel13 = pixel[13];
                var pixel14 = pixel[14];
                var pixel15 = pixel[15];

                for (i = 0; i < w * 3; ++i) {
                    buf[i] = 0;
                }

                for (i = sy; i < ey; ++i) {
                    ptr = ((i * w) + sx) | 0;
                    m3 = (i - 3) % 3;
                    curr = (m3 * w) | 0;
                    cornerpos = (m3 * (w + 1)) | 0;
                    for (j = 0; j < w; ++j) buf[curr + j] = 0;
                    ncorners = 0;

                    if (i < (ey - 1)) {
                        j = sx;

                        for (; j < ex; ++j, ++ptr) {
                            v = img[ptr];
                            tab = (-v + 255);
                            d = (thresh_tab[tab + img[ptr + pixel0]] | thresh_tab[tab + img[ptr + pixel8]]);

                            if (d == 0) {
                                continue;
                            }

                            d &= (thresh_tab[tab + img[ptr + pixel2]] | thresh_tab[tab + img[ptr + pixel10]]);
                            d &= (thresh_tab[tab + img[ptr + pixel4]] | thresh_tab[tab + img[ptr + pixel12]]);
                            d &= (thresh_tab[tab + img[ptr + pixel6]] | thresh_tab[tab + img[ptr + pixel14]]);

                            if (d == 0) {
                                continue;
                            }

                            d &= (thresh_tab[tab + img[ptr + pixel1]] | thresh_tab[tab + img[ptr + pixel9]]);
                            d &= (thresh_tab[tab + img[ptr + pixel3]] | thresh_tab[tab + img[ptr + pixel11]]);
                            d &= (thresh_tab[tab + img[ptr + pixel5]] | thresh_tab[tab + img[ptr + pixel13]]);
                            d &= (thresh_tab[tab + img[ptr + pixel7]] | thresh_tab[tab + img[ptr + pixel15]]);

                            if (d & 1) {
                                vt = (v - threshold);
                                _count = 0;

                                for (k = 0; k < N; ++k) {
                                    x = img[(ptr + pixel[k])];
                                    if (x < vt) {
                                        ++_count;
                                        if (_count > K) {
                                            ++ncorners;
                                            cpbuf[cornerpos + ncorners] = j;
                                            buf[curr + j] = score_func(img, ptr, pixel, sd, threshold);
                                            break;
                                        }
                                    }
                                    else {
                                        _count = 0;
                                    }
                                }
                            }

                            if (d & 2) {
                                vt = (v + threshold);
                                _count = 0;

                                for (k = 0; k < N; ++k) {
                                    x = img[(ptr + pixel[k])];
                                    if (x > vt) {
                                        ++_count;
                                        if (_count > K) {
                                            ++ncorners;
                                            cpbuf[cornerpos + ncorners] = j;
                                            buf[curr + j] = score_func(img, ptr, pixel, sd, threshold);
                                            break;
                                        }
                                    }
                                    else {
                                        _count = 0;
                                    }
                                }
                            }
                        }
                    }

                    cpbuf[cornerpos + w] = ncorners;

                    if (i == sy) {
                        continue;
                    }

                    m3 = (i - 4 + 3) % 3;
                    prev = (m3 * w) | 0;
                    cornerpos = (m3 * (w + 1)) | 0;
                    m3 = (i - 5 + 3) % 3;
                    pprev = (m3 * w) | 0;

                    ncorners = cpbuf[cornerpos + w];

                    for (k = 0; k < ncorners; ++k) {
                        j = cpbuf[cornerpos + k];
                        jp1 = (j + 1) | 0;
                        jm1 = (j - 1) | 0;
                        score = buf[prev + j];
                        if ((score > buf[prev + jp1] && score > buf[prev + jm1] &&
                            score > buf[pprev + jm1] && score > buf[pprev + j] && score > buf[pprev + jp1] &&
                            score > buf[curr + jm1] && score > buf[curr + j] && score > buf[curr + jp1])) {
                            // save corner
                            pt = corners[corners_cnt];
                            pt.x = j, pt.y = (i - 1), pt.score = score;
                            corners_cnt++;
                        }
                    }
                } // y loop
                jsfeat.cache.put_buffer(buf_node);
                jsfeat.cache.put_buffer(cpbuf_node);
                return corners_cnt;
            }
        };
    })();

    global.fast_corners = fast_corners;
    fast_corners.set_threshold(20); // set default

})(jsfeat);
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 *
 * Copyright 2007 Computer Vision Lab,
 * Ecole Polytechnique Federale de Lausanne (EPFL), Switzerland.
 * @author Vincent Lepetit (http://cvlab.epfl.ch/~lepetit)
 */

(function (global) {
    "use strict";
    //

    var yape06 = (function () {

        var compute_laplacian = function (src, dst, w, h, Dxx, Dyy, sx, sy, ex, ey) {
            var y = 0, x = 0, yrow = (sy * w + sx) | 0, row = yrow;

            for (y = sy; y < ey; ++y, yrow += w, row = yrow) {
                for (x = sx; x < ex; ++x, ++row) {
                    dst[row] = -4 * src[row] + src[row + Dxx] + src[row - Dxx] + src[row + Dyy] + src[row - Dyy];
                }
            }
        }

        var hessian_min_eigen_value = function (src, off, tr, Dxx, Dyy, Dxy, Dyx) {
            var Ixx = -2 * src[off] + src[off + Dxx] + src[off - Dxx];
            var Iyy = -2 * src[off] + src[off + Dyy] + src[off - Dyy];
            var Ixy = src[off + Dxy] + src[off - Dxy] - src[off + Dyx] - src[off - Dyx];
            var sqrt_delta = (Math.sqrt(((Ixx - Iyy) * (Ixx - Iyy) + 4 * Ixy * Ixy))) | 0;

            return Math.min(Math.abs(tr - sqrt_delta), Math.abs(-(tr + sqrt_delta)));
        }

        return {

            laplacian_threshold: 30,
            min_eigen_value_threshold: 25,

            detect: function (src, points, border) {
                if (typeof border === "undefined") { border = 5; }
                var x = 0, y = 0;
                var w = src.cols, h = src.rows, srd_d = src.data;
                var Dxx = 5, Dyy = (5 * w) | 0;
                var Dxy = (3 + 3 * w) | 0, Dyx = (3 - 3 * w) | 0;
                var lap_buf = jsfeat.cache.get_buffer((w * h) << 2);
                var laplacian = lap_buf.i32;
                var lv = 0, row = 0, rowx = 0, min_eigen_value = 0, pt;
                var number_of_points = 0;
                var lap_thresh = this.laplacian_threshold;
                var eigen_thresh = this.min_eigen_value_threshold;

                var sx = Math.max(5, border) | 0;
                var sy = Math.max(3, border) | 0;
                var ex = Math.min(w - 5, w - border) | 0;
                var ey = Math.min(h - 3, h - border) | 0;

                x = w * h;
                while (--x >= 0) { laplacian[x] = 0; }
                compute_laplacian(srd_d, laplacian, w, h, Dxx, Dyy, sx, sy, ex, ey);

                row = (sy * w + sx) | 0;
                for (y = sy; y < ey; ++y, row += w) {
                    for (x = sx, rowx = row; x < ex; ++x, ++rowx) {

                        lv = laplacian[rowx];
                        if ((lv < -lap_thresh &&
                            lv < laplacian[rowx - 1] && lv < laplacian[rowx + 1] &&
                            lv < laplacian[rowx - w] && lv < laplacian[rowx + w] &&
                            lv < laplacian[rowx - w - 1] && lv < laplacian[rowx + w - 1] &&
                            lv < laplacian[rowx - w + 1] && lv < laplacian[rowx + w + 1])
                            ||
                            (lv > lap_thresh &&
                            lv > laplacian[rowx - 1] && lv > laplacian[rowx + 1] &&
                            lv > laplacian[rowx - w] && lv > laplacian[rowx + w] &&
                            lv > laplacian[rowx - w - 1] && lv > laplacian[rowx + w - 1] &&
                            lv > laplacian[rowx - w + 1] && lv > laplacian[rowx + w + 1])
                            ) {

                            min_eigen_value = hessian_min_eigen_value(srd_d, rowx, lv, Dxx, Dyy, Dxy, Dyx);
                            if (min_eigen_value > eigen_thresh) {
                                pt = points[number_of_points];
                                pt.x = x, pt.y = y, pt.score = min_eigen_value;
                                ++number_of_points;
                                ++x, ++rowx; // skip next pixel since this is maxima in 3x3
                            }
                        }
                    }
                }

                jsfeat.cache.put_buffer(lap_buf);

                return number_of_points;
            }

        };
    })();

    global.yape06 = yape06;

})(jsfeat);
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 *
 * Copyright 2007 Computer Vision Lab,
 * Ecole Polytechnique Federale de Lausanne (EPFL), Switzerland.
 */

(function (global) {
    "use strict";
    //

    var yape = (function () {

        var precompute_directions = function (step, dirs, R) {
            var i = 0;
            var x, y;

            x = R;
            for (y = 0; y < x; y++, i++) {
                x = (Math.sqrt((R * R - y * y)) + 0.5) | 0;
                dirs[i] = (x + step * y);
            }
            for (x-- ; x < y && x >= 0; x--, i++) {
                y = (Math.sqrt((R * R - x * x)) + 0.5) | 0;
                dirs[i] = (x + step * y);
            }
            for (; -x < y; x--, i++) {
                y = (Math.sqrt((R * R - x * x)) + 0.5) | 0;
                dirs[i] = (x + step * y);
            }
            for (y-- ; y >= 0; y--, i++) {
                x = (-Math.sqrt((R * R - y * y)) - 0.5) | 0;
                dirs[i] = (x + step * y);
            }
            for (; y > x; y--, i++) {
                x = (-Math.sqrt((R * R - y * y)) - 0.5) | 0;
                dirs[i] = (x + step * y);
            }
            for (x++ ; x <= 0; x++, i++) {
                y = (-Math.sqrt((R * R - x * x)) - 0.5) | 0;
                dirs[i] = (x + step * y);
            }
            for (; x < -y; x++, i++) {
                y = (-Math.sqrt((R * R - x * x)) - 0.5) | 0;
                dirs[i] = (x + step * y);
            }
            for (y++ ; y < 0; y++, i++) {
                x = (Math.sqrt((R * R - y * y)) + 0.5) | 0;
                dirs[i] = (x + step * y);
            }

            dirs[i] = dirs[0];
            dirs[i + 1] = dirs[1];
            return i;
        }

        var third_check = function (Sb, off, step) {
            var n = 0;
            if (Sb[off + 1] != 0) n++;
            if (Sb[off - 1] != 0) n++;
            if (Sb[off + step] != 0) n++;
            if (Sb[off + step + 1] != 0) n++;
            if (Sb[off + step - 1] != 0) n++;
            if (Sb[off - step] != 0) n++;
            if (Sb[off - step + 1] != 0) n++;
            if (Sb[off - step - 1] != 0) n++;

            return n;
        }

        var is_local_maxima = function (p, off, v, step, neighborhood) {
            var x, y;

            if (v > 0) {
                off -= step * neighborhood;
                for (y = -neighborhood; y <= neighborhood; ++y) {
                    for (x = -neighborhood; x <= neighborhood; ++x) {
                        if (p[off + x] > v) return false;
                    }
                    off += step;
                }
            } else {
                off -= step * neighborhood;
                for (y = -neighborhood; y <= neighborhood; ++y) {
                    for (x = -neighborhood; x <= neighborhood; ++x) {
                        if (p[off + x] < v) return false;
                    }
                    off += step;
                }
            }
            return true;
        }

        var perform_one_point = function (I, x, Scores, Im, Ip, dirs, opposite, dirs_nb) {
            var score = 0;
            var a = 0, b = (opposite - 1) | 0;
            var A = 0, B0 = 0, B1 = 0, B2 = 0;
            var state = 0;

            // WE KNOW THAT NOT(A ~ I0 & B1 ~ I0):
            A = I[x + dirs[a]];
            if ((A <= Ip)) {
                if ((A >= Im)) { // A ~ I0
                    B0 = I[x + dirs[b]];
                    if ((B0 <= Ip)) {
                        if ((B0 >= Im)) { Scores[x] = 0; return; }
                        else {
                            b++; B1 = I[x + dirs[b]];
                            if ((B1 > Ip)) {
                                b++; B2 = I[x + dirs[b]];
                                if ((B2 > Ip)) state = 3;
                                else if ((B2 < Im)) state = 6;
                                else { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0
                            }
                            else/* if ((B1 < Im))*/ {
                                b++; B2 = I[x + dirs[b]];
                                if ((B2 > Ip)) state = 7;
                                else if ((B2 < Im)) state = 2;
                                else { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0
                            }
                            //else { Scores[x] = 0; return; } // A ~ I0, B1 ~ I0
                        }
                    }
                    else { // B0 < I0
                        b++; B1 = I[x + dirs[b]];
                        if ((B1 > Ip)) {
                            b++; B2 = I[x + dirs[b]];
                            if ((B2 > Ip)) state = 3;
                            else if ((B2 < Im)) state = 6;
                            else { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0
                        }
                        else if ((B1 < Im)) {
                            b++; B2 = I[x + dirs[b]];
                            if ((B2 > Ip)) state = 7;
                            else if ((B2 < Im)) state = 2;
                            else { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0
                        }
                        else { Scores[x] = 0; return; } // A ~ I0, B1 ~ I0
                    }
                }
                else { // A > I0
                    B0 = I[x + dirs[b]];
                    if ((B0 > Ip)) { Scores[x] = 0; return; }
                    b++; B1 = I[x + dirs[b]];
                    if ((B1 > Ip)) { Scores[x] = 0; return; }
                    b++; B2 = I[x + dirs[b]];
                    if ((B2 > Ip)) { Scores[x] = 0; return; }
                    state = 1;
                }
            }
            else // A < I0
            {
                B0 = I[x + dirs[b]];
                if ((B0 < Im)) { Scores[x] = 0; return; }
                b++; B1 = I[x + dirs[b]];
                if ((B1 < Im)) { Scores[x] = 0; return; }
                b++; B2 = I[x + dirs[b]];
                if ((B2 < Im)) { Scores[x] = 0; return; }
                state = 0;
            }

            for (a = 1; a <= opposite; a++) {
                A = I[x + dirs[a]];

                switch (state) {
                    case 0:
                        if ((A > Ip)) {
                            B1 = B2; b++; B2 = I[x + dirs[b]];
                            if ((B2 < Im)) { Scores[x] = 0; return; }
                            { score -= A + B1; state = 0; break; };
                        }
                        if ((A < Im)) {
                            if ((B1 > Ip)) { Scores[x] = 0; return; }
                            if ((B2 > Ip)) { Scores[x] = 0; return; }
                            B1 = B2; b++; B2 = I[x + dirs[b]];
                            if ((B2 > Ip)) { Scores[x] = 0; return; }
                            { score -= A + B1; state = 8; break; };
                        }
                        // A ~ I0
                        if ((B1 <= Ip)) { Scores[x] = 0; return; }
                        if ((B2 <= Ip)) { Scores[x] = 0; return; }
                        B1 = B2; b++; B2 = I[x + dirs[b]];
                        if ((B2 > Ip)) { score -= A + B1; state = 3; break; };
                        if ((B2 < Im)) { score -= A + B1; state = 6; break; };
                        { Scores[x] = 0; return; }

                    case 1:
                        if ((A < Im)) {
                            B1 = B2; b++; B2 = I[x + dirs[b]];
                            if ((B2 > Ip)) { Scores[x] = 0; return; }
                            { score -= A + B1; state = 1; break; };
                        }
                        if ((A > Ip)) {
                            if ((B1 < Im)) { Scores[x] = 0; return; }
                            if ((B2 < Im)) { Scores[x] = 0; return; }
                            B1 = B2; b++; B2 = I[x + dirs[b]];
                            if ((B2 < Im)) { Scores[x] = 0; return; }
                            { score -= A + B1; state = 9; break; };
                        }
                        // A ~ I0
                        if ((B1 >= Im)) { Scores[x] = 0; return; }
                        if ((B2 >= Im)) { Scores[x] = 0; return; }
                        B1 = B2; b++; B2 = I[x + dirs[b]];
                        if ((B2 < Im)) { score -= A + B1; state = 2; break; };
                        if ((B2 > Ip)) { score -= A + B1; state = 7; break; };
                        { Scores[x] = 0; return; }

                    case 2:
                        if ((A > Ip)) { Scores[x] = 0; return; }
                        B1 = B2; b++; B2 = I[x + dirs[b]];
                        if ((A < Im)) {
                            if ((B2 > Ip)) { Scores[x] = 0; return; }
                            { score -= A + B1; state = 4; break; };
                        }
                        // A ~ I0
                        if ((B2 > Ip)) { score -= A + B1; state = 7; break; };
                        if ((B2 < Im)) { score -= A + B1; state = 2; break; };
                        { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0

                    case 3:
                        if ((A < Im)) { Scores[x] = 0; return; }
                        B1 = B2; b++; B2 = I[x + dirs[b]];
                        if ((A > Ip)) {
                            if ((B2 < Im)) { Scores[x] = 0; return; }
                            { score -= A + B1; state = 5; break; };
                        }
                        // A ~ I0
                        if ((B2 > Ip)) { score -= A + B1; state = 3; break; };
                        if ((B2 < Im)) { score -= A + B1; state = 6; break; };
                        { Scores[x] = 0; return; }

                    case 4:
                        if ((A > Ip)) { Scores[x] = 0; return; }
                        if ((A < Im)) {
                            B1 = B2; b++; B2 = I[x + dirs[b]];
                            if ((B2 > Ip)) { Scores[x] = 0; return; }
                            { score -= A + B1; state = 1; break; };
                        }
                        if ((B2 >= Im)) { Scores[x] = 0; return; }
                        B1 = B2; b++; B2 = I[x + dirs[b]];
                        if ((B2 < Im)) { score -= A + B1; state = 2; break; };
                        if ((B2 > Ip)) { score -= A + B1; state = 7; break; };
                        { Scores[x] = 0; return; }

                    case 5:
                        if ((A < Im)) { Scores[x] = 0; return; }
                        if ((A > Ip)) {
                            B1 = B2; b++; B2 = I[x + dirs[b]];
                            if ((B2 < Im)) { Scores[x] = 0; return; }
                            { score -= A + B1; state = 0; break; };
                        }
                        // A ~ I0
                        if ((B2 <= Ip)) { Scores[x] = 0; return; }
                        B1 = B2; b++; B2 = I[x + dirs[b]];
                        if ((B2 > Ip)) { score -= A + B1; state = 3; break; };
                        if ((B2 < Im)) { score -= A + B1; state = 6; break; };
                        { Scores[x] = 0; return; }

                    case 7:
                        if ((A > Ip)) { Scores[x] = 0; return; }
                        if ((A < Im)) { Scores[x] = 0; return; }
                        B1 = B2; b++; B2 = I[x + dirs[b]];
                        // A ~ I0
                        if ((B2 > Ip)) { score -= A + B1; state = 3; break; };
                        if ((B2 < Im)) { score -= A + B1; state = 6; break; };
                        { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0

                    case 6:
                        if ((A > Ip)) { Scores[x] = 0; return; }
                        if ((A < Im)) { Scores[x] = 0; return; }
                        B1 = B2; b++; B2 = I[x + dirs[b]];
                        // A ~ I0
                        if ((B2 < Im)) { score -= A + B1; state = 2; break; };
                        if ((B2 > Ip)) { score -= A + B1; state = 7; break; };
                        { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0

                    case 8:
                        if ((A > Ip)) {
                            if ((B2 < Im)) { Scores[x] = 0; return; }
                            B1 = B2; b++; B2 = I[x + dirs[b]];
                            if ((B2 < Im)) { Scores[x] = 0; return; }
                            { score -= A + B1; state = 9; break; };
                        }
                        if ((A < Im)) {
                            B1 = B2; b++; B2 = I[x + dirs[b]];
                            if ((B2 > Ip)) { Scores[x] = 0; return; }
                            { score -= A + B1; state = 1; break; };
                        }
                        { Scores[x] = 0; return; }

                    case 9:
                        if ((A < Im)) {
                            if ((B2 > Ip)) { Scores[x] = 0; return; }
                            B1 = B2; b++; B2 = I[x + dirs[b]];
                            if ((B2 > Ip)) { Scores[x] = 0; return; }
                            { score -= A + B1; state = 8; break; };
                        }
                        if ((A > Ip)) {
                            B1 = B2; b++; B2 = I[x + dirs[b]];
                            if ((B2 < Im)) { Scores[x] = 0; return; }
                            { score -= A + B1; state = 0; break; };
                        }
                        { Scores[x] = 0; return; }

                    default:
                        //"PB default";
                        break;
                } // switch(state)
            } // for(a...)

            Scores[x] = (score + dirs_nb * I[x]);
        }

        var lev_table_t = (function () {
            function lev_table_t(w, h, r) {
                this.dirs = new Int32Array(1024);
                this.dirs_count = precompute_directions(w, this.dirs, r) | 0;
                this.scores = new Int32Array(w * h);
                this.radius = r | 0;
            }
            return lev_table_t;
        })();

        return {

            level_tables: [],
            tau: 7,

            init: function (width, height, radius, pyramid_levels) {
                if (typeof pyramid_levels === "undefined") { pyramid_levels = 1; }
                var i;
                radius = Math.min(radius, 7);
                radius = Math.max(radius, 3);
                for (i = 0; i < pyramid_levels; ++i) {
                    this.level_tables[i] = new lev_table_t(width >> i, height >> i, radius);
                }
            },

            detect: function (src, points, border) {
                if (typeof border === "undefined") { border = 4; }
                var t = this.level_tables[0];
                var R = t.radius | 0, Rm1 = (R - 1) | 0;
                var dirs = t.dirs;
                var dirs_count = t.dirs_count | 0;
                var opposite = dirs_count >> 1;
                var img = src.data, w = src.cols | 0, h = src.rows | 0, hw = w >> 1;
                var scores = t.scores;
                var x = 0, y = 0, row = 0, rowx = 0, ip = 0, im = 0, abs_score = 0, score = 0;
                var tau = this.tau | 0;
                var number_of_points = 0, pt;

                var sx = Math.max(R + 1, border) | 0;
                var sy = Math.max(R + 1, border) | 0;
                var ex = Math.min(w - R - 2, w - border) | 0;
                var ey = Math.min(h - R - 2, h - border) | 0;

                row = (sy * w + sx) | 0;
                for (y = sy; y < ey; ++y, row += w) {
                    for (x = sx, rowx = row; x < ex; ++x, ++rowx) {
                        ip = img[rowx] + tau, im = img[rowx] - tau;

                        if (im < img[rowx + R] && img[rowx + R] < ip && im < img[rowx - R] && img[rowx - R] < ip) {
                            scores[rowx] = 0;
                        } else {
                            perform_one_point(img, rowx, scores, im, ip, dirs, opposite, dirs_count);
                        }
                    }
                }

                // local maxima
                row = (sy * w + sx) | 0;
                for (y = sy; y < ey; ++y, row += w) {
                    for (x = sx, rowx = row; x < ex; ++x, ++rowx) {
                        score = scores[rowx];
                        abs_score = Math.abs(score);
                        if (abs_score < 5) {
                            // if this pixel is 0, the next one will not be good enough. Skip it.
                            ++x, ++rowx;
                        } else {
                            if (third_check(scores, rowx, w) >= 3 && is_local_maxima(scores, rowx, score, hw, R)) {
                                pt = points[number_of_points];
                                pt.x = x, pt.y = y, pt.score = abs_score;
                                ++number_of_points;

                                x += Rm1, rowx += Rm1;
                            }
                        }
                    }
                }

                return number_of_points;
            }
        };

    })();

    global.yape = yape;

})(jsfeat);
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 *
 * Original implementation derived from OpenCV,
 * @authors Ethan Rublee, Vincent Rabaud, Gary Bradski
 */

(function (global) {
    "use strict";
    //

    var orb = (function () {

        var bit_pattern_31_ = new Int32Array([
		    8, -3, 9, 5/*mean (0), correlation (0)*/,
		    4, 2, 7, -12/*mean (1.12461e-05), correlation (0.0437584)*/,
		    -11, 9, -8, 2/*mean (3.37382e-05), correlation (0.0617409)*/,
		    7, -12, 12, -13/*mean (5.62303e-05), correlation (0.0636977)*/,
		    2, -13, 2, 12/*mean (0.000134953), correlation (0.085099)*/,
		    1, -7, 1, 6/*mean (0.000528565), correlation (0.0857175)*/,
		    -2, -10, -2, -4/*mean (0.0188821), correlation (0.0985774)*/,
		    -13, -13, -11, -8/*mean (0.0363135), correlation (0.0899616)*/,
		    -13, -3, -12, -9/*mean (0.121806), correlation (0.099849)*/,
		    10, 4, 11, 9/*mean (0.122065), correlation (0.093285)*/,
		    -13, -8, -8, -9/*mean (0.162787), correlation (0.0942748)*/,
		    -11, 7, -9, 12/*mean (0.21561), correlation (0.0974438)*/,
		    7, 7, 12, 6/*mean (0.160583), correlation (0.130064)*/,
		    -4, -5, -3, 0/*mean (0.228171), correlation (0.132998)*/,
		    -13, 2, -12, -3/*mean (0.00997526), correlation (0.145926)*/,
		    -9, 0, -7, 5/*mean (0.198234), correlation (0.143636)*/,
		    12, -6, 12, -1/*mean (0.0676226), correlation (0.16689)*/,
		    -3, 6, -2, 12/*mean (0.166847), correlation (0.171682)*/,
		    -6, -13, -4, -8/*mean (0.101215), correlation (0.179716)*/,
		    11, -13, 12, -8/*mean (0.200641), correlation (0.192279)*/,
		    4, 7, 5, 1/*mean (0.205106), correlation (0.186848)*/,
		    5, -3, 10, -3/*mean (0.234908), correlation (0.192319)*/,
		    3, -7, 6, 12/*mean (0.0709964), correlation (0.210872)*/,
		    -8, -7, -6, -2/*mean (0.0939834), correlation (0.212589)*/,
		    -2, 11, -1, -10/*mean (0.127778), correlation (0.20866)*/,
		    -13, 12, -8, 10/*mean (0.14783), correlation (0.206356)*/,
		    -7, 3, -5, -3/*mean (0.182141), correlation (0.198942)*/,
		    -4, 2, -3, 7/*mean (0.188237), correlation (0.21384)*/,
		    -10, -12, -6, 11/*mean (0.14865), correlation (0.23571)*/,
		    5, -12, 6, -7/*mean (0.222312), correlation (0.23324)*/,
		    5, -6, 7, -1/*mean (0.229082), correlation (0.23389)*/,
		    1, 0, 4, -5/*mean (0.241577), correlation (0.215286)*/,
		    9, 11, 11, -13/*mean (0.00338507), correlation (0.251373)*/,
		    4, 7, 4, 12/*mean (0.131005), correlation (0.257622)*/,
		    2, -1, 4, 4/*mean (0.152755), correlation (0.255205)*/,
		    -4, -12, -2, 7/*mean (0.182771), correlation (0.244867)*/,
		    -8, -5, -7, -10/*mean (0.186898), correlation (0.23901)*/,
		    4, 11, 9, 12/*mean (0.226226), correlation (0.258255)*/,
		    0, -8, 1, -13/*mean (0.0897886), correlation (0.274827)*/,
		    -13, -2, -8, 2/*mean (0.148774), correlation (0.28065)*/,
		    -3, -2, -2, 3/*mean (0.153048), correlation (0.283063)*/,
		    -6, 9, -4, -9/*mean (0.169523), correlation (0.278248)*/,
		    8, 12, 10, 7/*mean (0.225337), correlation (0.282851)*/,
		    0, 9, 1, 3/*mean (0.226687), correlation (0.278734)*/,
		    7, -5, 11, -10/*mean (0.00693882), correlation (0.305161)*/,
		    -13, -6, -11, 0/*mean (0.0227283), correlation (0.300181)*/,
		    10, 7, 12, 1/*mean (0.125517), correlation (0.31089)*/,
		    -6, -3, -6, 12/*mean (0.131748), correlation (0.312779)*/,
		    10, -9, 12, -4/*mean (0.144827), correlation (0.292797)*/,
		    -13, 8, -8, -12/*mean (0.149202), correlation (0.308918)*/,
		    -13, 0, -8, -4/*mean (0.160909), correlation (0.310013)*/,
		    3, 3, 7, 8/*mean (0.177755), correlation (0.309394)*/,
		    5, 7, 10, -7/*mean (0.212337), correlation (0.310315)*/,
		    -1, 7, 1, -12/*mean (0.214429), correlation (0.311933)*/,
		    3, -10, 5, 6/*mean (0.235807), correlation (0.313104)*/,
		    2, -4, 3, -10/*mean (0.00494827), correlation (0.344948)*/,
		    -13, 0, -13, 5/*mean (0.0549145), correlation (0.344675)*/,
		    -13, -7, -12, 12/*mean (0.103385), correlation (0.342715)*/,
		    -13, 3, -11, 8/*mean (0.134222), correlation (0.322922)*/,
		    -7, 12, -4, 7/*mean (0.153284), correlation (0.337061)*/,
		    6, -10, 12, 8/*mean (0.154881), correlation (0.329257)*/,
		    -9, -1, -7, -6/*mean (0.200967), correlation (0.33312)*/,
		    -2, -5, 0, 12/*mean (0.201518), correlation (0.340635)*/,
		    -12, 5, -7, 5/*mean (0.207805), correlation (0.335631)*/,
		    3, -10, 8, -13/*mean (0.224438), correlation (0.34504)*/,
		    -7, -7, -4, 5/*mean (0.239361), correlation (0.338053)*/,
		    -3, -2, -1, -7/*mean (0.240744), correlation (0.344322)*/,
		    2, 9, 5, -11/*mean (0.242949), correlation (0.34145)*/,
		    -11, -13, -5, -13/*mean (0.244028), correlation (0.336861)*/,
		    -1, 6, 0, -1/*mean (0.247571), correlation (0.343684)*/,
		    5, -3, 5, 2/*mean (0.000697256), correlation (0.357265)*/,
		    -4, -13, -4, 12/*mean (0.00213675), correlation (0.373827)*/,
		    -9, -6, -9, 6/*mean (0.0126856), correlation (0.373938)*/,
		    -12, -10, -8, -4/*mean (0.0152497), correlation (0.364237)*/,
		    10, 2, 12, -3/*mean (0.0299933), correlation (0.345292)*/,
		    7, 12, 12, 12/*mean (0.0307242), correlation (0.366299)*/,
		    -7, -13, -6, 5/*mean (0.0534975), correlation (0.368357)*/,
		    -4, 9, -3, 4/*mean (0.099865), correlation (0.372276)*/,
		    7, -1, 12, 2/*mean (0.117083), correlation (0.364529)*/,
		    -7, 6, -5, 1/*mean (0.126125), correlation (0.369606)*/,
		    -13, 11, -12, 5/*mean (0.130364), correlation (0.358502)*/,
		    -3, 7, -2, -6/*mean (0.131691), correlation (0.375531)*/,
		    7, -8, 12, -7/*mean (0.160166), correlation (0.379508)*/,
		    -13, -7, -11, -12/*mean (0.167848), correlation (0.353343)*/,
		    1, -3, 12, 12/*mean (0.183378), correlation (0.371916)*/,
		    2, -6, 3, 0/*mean (0.228711), correlation (0.371761)*/,
		    -4, 3, -2, -13/*mean (0.247211), correlation (0.364063)*/,
		    -1, -13, 1, 9/*mean (0.249325), correlation (0.378139)*/,
		    7, 1, 8, -6/*mean (0.000652272), correlation (0.411682)*/,
		    1, -1, 3, 12/*mean (0.00248538), correlation (0.392988)*/,
		    9, 1, 12, 6/*mean (0.0206815), correlation (0.386106)*/,
		    -1, -9, -1, 3/*mean (0.0364485), correlation (0.410752)*/,
		    -13, -13, -10, 5/*mean (0.0376068), correlation (0.398374)*/,
		    7, 7, 10, 12/*mean (0.0424202), correlation (0.405663)*/,
		    12, -5, 12, 9/*mean (0.0942645), correlation (0.410422)*/,
		    6, 3, 7, 11/*mean (0.1074), correlation (0.413224)*/,
		    5, -13, 6, 10/*mean (0.109256), correlation (0.408646)*/,
		    2, -12, 2, 3/*mean (0.131691), correlation (0.416076)*/,
		    3, 8, 4, -6/*mean (0.165081), correlation (0.417569)*/,
		    2, 6, 12, -13/*mean (0.171874), correlation (0.408471)*/,
		    9, -12, 10, 3/*mean (0.175146), correlation (0.41296)*/,
		    -8, 4, -7, 9/*mean (0.183682), correlation (0.402956)*/,
		    -11, 12, -4, -6/*mean (0.184672), correlation (0.416125)*/,
		    1, 12, 2, -8/*mean (0.191487), correlation (0.386696)*/,
		    6, -9, 7, -4/*mean (0.192668), correlation (0.394771)*/,
		    2, 3, 3, -2/*mean (0.200157), correlation (0.408303)*/,
		    6, 3, 11, 0/*mean (0.204588), correlation (0.411762)*/,
		    3, -3, 8, -8/*mean (0.205904), correlation (0.416294)*/,
		    7, 8, 9, 3/*mean (0.213237), correlation (0.409306)*/,
		    -11, -5, -6, -4/*mean (0.243444), correlation (0.395069)*/,
		    -10, 11, -5, 10/*mean (0.247672), correlation (0.413392)*/,
		    -5, -8, -3, 12/*mean (0.24774), correlation (0.411416)*/,
		    -10, 5, -9, 0/*mean (0.00213675), correlation (0.454003)*/,
		    8, -1, 12, -6/*mean (0.0293635), correlation (0.455368)*/,
		    4, -6, 6, -11/*mean (0.0404971), correlation (0.457393)*/,
		    -10, 12, -8, 7/*mean (0.0481107), correlation (0.448364)*/,
		    4, -2, 6, 7/*mean (0.050641), correlation (0.455019)*/,
		    -2, 0, -2, 12/*mean (0.0525978), correlation (0.44338)*/,
		    -5, -8, -5, 2/*mean (0.0629667), correlation (0.457096)*/,
		    7, -6, 10, 12/*mean (0.0653846), correlation (0.445623)*/,
		    -9, -13, -8, -8/*mean (0.0858749), correlation (0.449789)*/,
		    -5, -13, -5, -2/*mean (0.122402), correlation (0.450201)*/,
		    8, -8, 9, -13/*mean (0.125416), correlation (0.453224)*/,
		    -9, -11, -9, 0/*mean (0.130128), correlation (0.458724)*/,
		    1, -8, 1, -2/*mean (0.132467), correlation (0.440133)*/,
		    7, -4, 9, 1/*mean (0.132692), correlation (0.454)*/,
		    -2, 1, -1, -4/*mean (0.135695), correlation (0.455739)*/,
		    11, -6, 12, -11/*mean (0.142904), correlation (0.446114)*/,
		    -12, -9, -6, 4/*mean (0.146165), correlation (0.451473)*/,
		    3, 7, 7, 12/*mean (0.147627), correlation (0.456643)*/,
		    5, 5, 10, 8/*mean (0.152901), correlation (0.455036)*/,
		    0, -4, 2, 8/*mean (0.167083), correlation (0.459315)*/,
		    -9, 12, -5, -13/*mean (0.173234), correlation (0.454706)*/,
		    0, 7, 2, 12/*mean (0.18312), correlation (0.433855)*/,
		    -1, 2, 1, 7/*mean (0.185504), correlation (0.443838)*/,
		    5, 11, 7, -9/*mean (0.185706), correlation (0.451123)*/,
		    3, 5, 6, -8/*mean (0.188968), correlation (0.455808)*/,
		    -13, -4, -8, 9/*mean (0.191667), correlation (0.459128)*/,
		    -5, 9, -3, -3/*mean (0.193196), correlation (0.458364)*/,
		    -4, -7, -3, -12/*mean (0.196536), correlation (0.455782)*/,
		    6, 5, 8, 0/*mean (0.1972), correlation (0.450481)*/,
		    -7, 6, -6, 12/*mean (0.199438), correlation (0.458156)*/,
		    -13, 6, -5, -2/*mean (0.211224), correlation (0.449548)*/,
		    1, -10, 3, 10/*mean (0.211718), correlation (0.440606)*/,
		    4, 1, 8, -4/*mean (0.213034), correlation (0.443177)*/,
		    -2, -2, 2, -13/*mean (0.234334), correlation (0.455304)*/,
		    2, -12, 12, 12/*mean (0.235684), correlation (0.443436)*/,
		    -2, -13, 0, -6/*mean (0.237674), correlation (0.452525)*/,
		    4, 1, 9, 3/*mean (0.23962), correlation (0.444824)*/,
		    -6, -10, -3, -5/*mean (0.248459), correlation (0.439621)*/,
		    -3, -13, -1, 1/*mean (0.249505), correlation (0.456666)*/,
		    7, 5, 12, -11/*mean (0.00119208), correlation (0.495466)*/,
		    4, -2, 5, -7/*mean (0.00372245), correlation (0.484214)*/,
		    -13, 9, -9, -5/*mean (0.00741116), correlation (0.499854)*/,
		    7, 1, 8, 6/*mean (0.0208952), correlation (0.499773)*/,
		    7, -8, 7, 6/*mean (0.0220085), correlation (0.501609)*/,
		    -7, -4, -7, 1/*mean (0.0233806), correlation (0.496568)*/,
		    -8, 11, -7, -8/*mean (0.0236505), correlation (0.489719)*/,
		    -13, 6, -12, -8/*mean (0.0268781), correlation (0.503487)*/,
		    2, 4, 3, 9/*mean (0.0323324), correlation (0.501938)*/,
		    10, -5, 12, 3/*mean (0.0399235), correlation (0.494029)*/,
		    -6, -5, -6, 7/*mean (0.0420153), correlation (0.486579)*/,
		    8, -3, 9, -8/*mean (0.0548021), correlation (0.484237)*/,
		    2, -12, 2, 8/*mean (0.0616622), correlation (0.496642)*/,
		    -11, -2, -10, 3/*mean (0.0627755), correlation (0.498563)*/,
		    -12, -13, -7, -9/*mean (0.0829622), correlation (0.495491)*/,
		    -11, 0, -10, -5/*mean (0.0843342), correlation (0.487146)*/,
		    5, -3, 11, 8/*mean (0.0929937), correlation (0.502315)*/,
		    -2, -13, -1, 12/*mean (0.113327), correlation (0.48941)*/,
		    -1, -8, 0, 9/*mean (0.132119), correlation (0.467268)*/,
		    -13, -11, -12, -5/*mean (0.136269), correlation (0.498771)*/,
		    -10, -2, -10, 11/*mean (0.142173), correlation (0.498714)*/,
		    -3, 9, -2, -13/*mean (0.144141), correlation (0.491973)*/,
		    2, -3, 3, 2/*mean (0.14892), correlation (0.500782)*/,
		    -9, -13, -4, 0/*mean (0.150371), correlation (0.498211)*/,
		    -4, 6, -3, -10/*mean (0.152159), correlation (0.495547)*/,
		    -4, 12, -2, -7/*mean (0.156152), correlation (0.496925)*/,
		    -6, -11, -4, 9/*mean (0.15749), correlation (0.499222)*/,
		    6, -3, 6, 11/*mean (0.159211), correlation (0.503821)*/,
		    -13, 11, -5, 5/*mean (0.162427), correlation (0.501907)*/,
		    11, 11, 12, 6/*mean (0.16652), correlation (0.497632)*/,
		    7, -5, 12, -2/*mean (0.169141), correlation (0.484474)*/,
		    -1, 12, 0, 7/*mean (0.169456), correlation (0.495339)*/,
		    -4, -8, -3, -2/*mean (0.171457), correlation (0.487251)*/,
		    -7, 1, -6, 7/*mean (0.175), correlation (0.500024)*/,
		    -13, -12, -8, -13/*mean (0.175866), correlation (0.497523)*/,
		    -7, -2, -6, -8/*mean (0.178273), correlation (0.501854)*/,
		    -8, 5, -6, -9/*mean (0.181107), correlation (0.494888)*/,
		    -5, -1, -4, 5/*mean (0.190227), correlation (0.482557)*/,
		    -13, 7, -8, 10/*mean (0.196739), correlation (0.496503)*/,
		    1, 5, 5, -13/*mean (0.19973), correlation (0.499759)*/,
		    1, 0, 10, -13/*mean (0.204465), correlation (0.49873)*/,
		    9, 12, 10, -1/*mean (0.209334), correlation (0.49063)*/,
		    5, -8, 10, -9/*mean (0.211134), correlation (0.503011)*/,
		    -1, 11, 1, -13/*mean (0.212), correlation (0.499414)*/,
		    -9, -3, -6, 2/*mean (0.212168), correlation (0.480739)*/,
		    -1, -10, 1, 12/*mean (0.212731), correlation (0.502523)*/,
		    -13, 1, -8, -10/*mean (0.21327), correlation (0.489786)*/,
		    8, -11, 10, -6/*mean (0.214159), correlation (0.488246)*/,
		    2, -13, 3, -6/*mean (0.216993), correlation (0.50287)*/,
		    7, -13, 12, -9/*mean (0.223639), correlation (0.470502)*/,
		    -10, -10, -5, -7/*mean (0.224089), correlation (0.500852)*/,
		    -10, -8, -8, -13/*mean (0.228666), correlation (0.502629)*/,
		    4, -6, 8, 5/*mean (0.22906), correlation (0.498305)*/,
		    3, 12, 8, -13/*mean (0.233378), correlation (0.503825)*/,
		    -4, 2, -3, -3/*mean (0.234323), correlation (0.476692)*/,
		    5, -13, 10, -12/*mean (0.236392), correlation (0.475462)*/,
		    4, -13, 5, -1/*mean (0.236842), correlation (0.504132)*/,
		    -9, 9, -4, 3/*mean (0.236977), correlation (0.497739)*/,
		    0, 3, 3, -9/*mean (0.24314), correlation (0.499398)*/,
		    -12, 1, -6, 1/*mean (0.243297), correlation (0.489447)*/,
		    3, 2, 4, -8/*mean (0.00155196), correlation (0.553496)*/,
		    -10, -10, -10, 9/*mean (0.00239541), correlation (0.54297)*/,
		    8, -13, 12, 12/*mean (0.0034413), correlation (0.544361)*/,
		    -8, -12, -6, -5/*mean (0.003565), correlation (0.551225)*/,
		    2, 2, 3, 7/*mean (0.00835583), correlation (0.55285)*/,
		    10, 6, 11, -8/*mean (0.00885065), correlation (0.540913)*/,
		    6, 8, 8, -12/*mean (0.0101552), correlation (0.551085)*/,
		    -7, 10, -6, 5/*mean (0.0102227), correlation (0.533635)*/,
		    -3, -9, -3, 9/*mean (0.0110211), correlation (0.543121)*/,
		    -1, -13, -1, 5/*mean (0.0113473), correlation (0.550173)*/,
		    -3, -7, -3, 4/*mean (0.0140913), correlation (0.554774)*/,
		    -8, -2, -8, 3/*mean (0.017049), correlation (0.55461)*/,
		    4, 2, 12, 12/*mean (0.01778), correlation (0.546921)*/,
		    2, -5, 3, 11/*mean (0.0224022), correlation (0.549667)*/,
		    6, -9, 11, -13/*mean (0.029161), correlation (0.546295)*/,
		    3, -1, 7, 12/*mean (0.0303081), correlation (0.548599)*/,
		    11, -1, 12, 4/*mean (0.0355151), correlation (0.523943)*/,
		    -3, 0, -3, 6/*mean (0.0417904), correlation (0.543395)*/,
		    4, -11, 4, 12/*mean (0.0487292), correlation (0.542818)*/,
		    2, -4, 2, 1/*mean (0.0575124), correlation (0.554888)*/,
		    -10, -6, -8, 1/*mean (0.0594242), correlation (0.544026)*/,
		    -13, 7, -11, 1/*mean (0.0597391), correlation (0.550524)*/,
		    -13, 12, -11, -13/*mean (0.0608974), correlation (0.55383)*/,
		    6, 0, 11, -13/*mean (0.065126), correlation (0.552006)*/,
		    0, -1, 1, 4/*mean (0.074224), correlation (0.546372)*/,
		    -13, 3, -9, -2/*mean (0.0808592), correlation (0.554875)*/,
		    -9, 8, -6, -3/*mean (0.0883378), correlation (0.551178)*/,
		    -13, -6, -8, -2/*mean (0.0901035), correlation (0.548446)*/,
		    5, -9, 8, 10/*mean (0.0949843), correlation (0.554694)*/,
		    2, 7, 3, -9/*mean (0.0994152), correlation (0.550979)*/,
		    -1, -6, -1, -1/*mean (0.10045), correlation (0.552714)*/,
		    9, 5, 11, -2/*mean (0.100686), correlation (0.552594)*/,
		    11, -3, 12, -8/*mean (0.101091), correlation (0.532394)*/,
		    3, 0, 3, 5/*mean (0.101147), correlation (0.525576)*/,
		    -1, 4, 0, 10/*mean (0.105263), correlation (0.531498)*/,
		    3, -6, 4, 5/*mean (0.110785), correlation (0.540491)*/,
		    -13, 0, -10, 5/*mean (0.112798), correlation (0.536582)*/,
		    5, 8, 12, 11/*mean (0.114181), correlation (0.555793)*/,
		    8, 9, 9, -6/*mean (0.117431), correlation (0.553763)*/,
		    7, -4, 8, -12/*mean (0.118522), correlation (0.553452)*/,
		    -10, 4, -10, 9/*mean (0.12094), correlation (0.554785)*/,
		    7, 3, 12, 4/*mean (0.122582), correlation (0.555825)*/,
		    9, -7, 10, -2/*mean (0.124978), correlation (0.549846)*/,
		    7, 0, 12, -2/*mean (0.127002), correlation (0.537452)*/,
		    -1, -6, 0, -11/*mean (0.127148), correlation (0.547401)*/
        ]);

        var H = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);
        var patch_img = new jsfeat.matrix_t(32, 32, jsfeat.U8_t | jsfeat.C1_t);

        var rectify_patch = function (src, dst, angle, px, py, psize) {
            var cosine = Math.cos(angle);
            var sine = Math.sin(angle);

            H.data[0] = cosine, H.data[1] = -sine, H.data[2] = (-cosine + sine) * psize * 0.5 + px,
	        H.data[3] = sine, H.data[4] = cosine, H.data[5] = (-sine - cosine) * psize * 0.5 + py;

            jsfeat.imgproc.warp_affine(src, dst, H, 128);
        }

        return {

            describe: function (src, corners, count, descriptors) {
                var DESCR_SIZE = 32; // bytes;
                var i = 0, b = 0, px = 0.0, py = 0.0, angle = 0.0;
                var t0 = 0, t1 = 0, val = 0;
                var img = src.data, w = src.cols, h = src.rows;
                var patch_d = patch_img.data;
                var patch_off = 16 * 32 + 16; // center of patch
                var patt = 0;

                if (!(descriptors.type & jsfeat.U8_t)) {
                    // relocate to U8 type
                    descriptors.type = jsfeat.U8_t;
                    descriptors.cols = DESCR_SIZE;
                    descriptors.rows = count;
                    descriptors.channel = 1;
                    descriptors.allocate();
                } else {
                    descriptors.resize(DESCR_SIZE, count, 1);
                }

                var descr_d = descriptors.data;
                var descr_off = 0;

                for (i = 0; i < count; ++i) {
                    px = corners[i].x;
                    py = corners[i].y;
                    angle = corners[i].angle;

                    rectify_patch(src, patch_img, angle, px, py, 32);

                    // describe the patch
                    patt = 0;
                    for (b = 0; b < DESCR_SIZE; ++b) {

                        t0 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        t1 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        val = (t0 < t1) | 0;

                        t0 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        t1 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        val |= (t0 < t1) << 1;

                        t0 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        t1 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        val |= (t0 < t1) << 2;

                        t0 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        t1 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        val |= (t0 < t1) << 3;

                        t0 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        t1 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        val |= (t0 < t1) << 4;

                        t0 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        t1 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        val |= (t0 < t1) << 5;

                        t0 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        t1 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        val |= (t0 < t1) << 6;

                        t0 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        t1 = patch_d[patch_off + bit_pattern_31_[patt + 1] * 32 + bit_pattern_31_[patt]]; patt += 2
                        val |= (t0 < t1) << 7;

                        descr_d[descr_off + b] = val;
                    }
                    descr_off += DESCR_SIZE;
                }
            }
        };
    })();

    global.orb = orb;

})(jsfeat);
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 *
 * this code is a rewrite from OpenCV's Lucas-Kanade optical flow implementation
 */

(function (global) {
    "use strict";
    //
    var optical_flow_lk = (function () {

        // short link to shar deriv
        var scharr_deriv = jsfeat.imgproc.scharr_derivatives;

        return {
            track: function (prev_pyr, curr_pyr, prev_xy, curr_xy, count, win_size, max_iter, status, eps, min_eigen_threshold) {
                if (typeof max_iter === "undefined") { max_iter = 30; }
                if (typeof status === "undefined") { status = new Uint8Array(count); }
                if (typeof eps === "undefined") { eps = 0.01; }
                if (typeof min_eigen_threshold === "undefined") { min_eigen_threshold = 0.0001; }

                var half_win = (win_size - 1) * 0.5;
                var win_area = (win_size * win_size) | 0;
                var win_area2 = win_area << 1;
                var prev_imgs = prev_pyr.data, next_imgs = curr_pyr.data;
                var img_prev = prev_imgs[0].data, img_next = next_imgs[0].data;
                var w0 = prev_imgs[0].cols, h0 = prev_imgs[0].rows, lw = 0, lh = 0;

                var iwin_node = jsfeat.cache.get_buffer(win_area << 2);
                var deriv_iwin_node = jsfeat.cache.get_buffer(win_area2 << 2);
                var deriv_lev_node = jsfeat.cache.get_buffer((h0 * (w0 << 1)) << 2);

                var deriv_m = new jsfeat.matrix_t(w0, h0, jsfeat.S32C2_t, deriv_lev_node.data);

                var iwin_buf = iwin_node.i32;
                var deriv_iwin = deriv_iwin_node.i32;
                var deriv_lev = deriv_lev_node.i32;

                var dstep = 0, src = 0, dsrc = 0, iptr = 0, diptr = 0, jptr = 0;
                var lev_sc = 0.0, prev_x = 0.0, prev_y = 0.0, next_x = 0.0, next_y = 0.0;
                var prev_delta_x = 0.0, prev_delta_y = 0.0, delta_x = 0.0, delta_y = 0.0;
                var iprev_x = 0, iprev_y = 0, inext_x = 0, inext_y = 0;
                var i = 0, j = 0, x = 0, y = 0, level = 0, ptid = 0, iter = 0;
                var brd_tl = 0, brd_r = 0, brd_b = 0;
                var a = 0.0, b = 0.0, b1 = 0.0, b2 = 0.0;

                // fixed point math
                var W_BITS14 = 14;
                var W_BITS4 = 14;
                var W_BITS1m5 = W_BITS4 - 5;
                var W_BITS1m51 = (1 << ((W_BITS1m5) - 1));
                var W_BITS14_ = (1 << W_BITS14);
                var W_BITS41 = (1 << ((W_BITS4) - 1));
                var FLT_SCALE = 1.0 / (1 << 20);
                var iw00 = 0, iw01 = 0, iw10 = 0, iw11 = 0, ival = 0, ixval = 0, iyval = 0;
                var A11 = 0.0, A12 = 0.0, A22 = 0.0, D = 0.0, min_eig = 0.0;

                var FLT_EPSILON = 0.00000011920929;
                eps *= eps;

                // reset status
                for (; i < count; ++i) {
                    status[i] = 1;
                }

                var max_level = (prev_pyr.levels - 1) | 0;
                level = max_level;

                for (; level >= 0; --level) {
                    lev_sc = (1.0 / (1 << level));
                    lw = w0 >> level;
                    lh = h0 >> level;
                    dstep = lw << 1;
                    img_prev = prev_imgs[level].data;
                    img_next = next_imgs[level].data;

                    brd_r = (lw - win_size) | 0;
                    brd_b = (lh - win_size) | 0;

                    // calculate level derivatives
                    scharr_deriv(prev_imgs[level], deriv_m);

                    // iterate through points
                    for (ptid = 0; ptid < count; ++ptid) {
                        i = ptid << 1;
                        j = i + 1;
                        prev_x = prev_xy[i] * lev_sc;
                        prev_y = prev_xy[j] * lev_sc;

                        if (level == max_level) {
                            next_x = prev_x;
                            next_y = prev_y;
                        } else {
                            next_x = curr_xy[i] * 2.0;
                            next_y = curr_xy[j] * 2.0;
                        }
                        curr_xy[i] = next_x;
                        curr_xy[j] = next_y;

                        prev_x -= half_win;
                        prev_y -= half_win;
                        iprev_x = prev_x | 0;
                        iprev_y = prev_y | 0;

                        // border check
                        x = (iprev_x <= brd_tl) | (iprev_x >= brd_r) | (iprev_y <= brd_tl) | (iprev_y >= brd_b);
                        if (x != 0) {
                            if (level == 0) {
                                status[ptid] = 0;
                            }
                            continue;
                        }

                        a = prev_x - iprev_x;
                        b = prev_y - iprev_y;
                        iw00 = (((1.0 - a) * (1.0 - b) * W_BITS14_) + 0.5) | 0;
                        iw01 = ((a * (1.0 - b) * W_BITS14_) + 0.5) | 0;
                        iw10 = (((1.0 - a) * b * W_BITS14_) + 0.5) | 0;
                        iw11 = (W_BITS14_ - iw00 - iw01 - iw10);

                        A11 = 0.0, A12 = 0.0, A22 = 0.0;

                        // extract the patch from the first image, compute covariation matrix of derivatives
                        for (y = 0; y < win_size; ++y) {
                            src = ((y + iprev_y) * lw + iprev_x) | 0;
                            dsrc = src << 1;

                            iptr = (y * win_size) | 0;
                            diptr = iptr << 1;
                            for (x = 0 ; x < win_size; ++x, ++src, ++iptr, dsrc += 2) {
                                ival = ((img_prev[src]) * iw00 + (img_prev[src + 1]) * iw01 +
                                        (img_prev[src + lw]) * iw10 + (img_prev[src + lw + 1]) * iw11);
                                ival = (((ival) + W_BITS1m51) >> (W_BITS1m5));

                                ixval = (deriv_lev[dsrc] * iw00 + deriv_lev[dsrc + 2] * iw01 +
                                        deriv_lev[dsrc + dstep] * iw10 + deriv_lev[dsrc + dstep + 2] * iw11);
                                ixval = (((ixval) + W_BITS41) >> (W_BITS4));

                                iyval = (deriv_lev[dsrc + 1] * iw00 + deriv_lev[dsrc + 3] * iw01 + deriv_lev[dsrc + dstep + 1] * iw10 +
                                        deriv_lev[dsrc + dstep + 3] * iw11);
                                iyval = (((iyval) + W_BITS41) >> (W_BITS4));

                                iwin_buf[iptr] = ival;
                                deriv_iwin[diptr++] = ixval;
                                deriv_iwin[diptr++] = iyval;

                                A11 += ixval * ixval;
                                A12 += ixval * iyval;
                                A22 += iyval * iyval;
                            }
                        }

                        A11 *= FLT_SCALE; A12 *= FLT_SCALE; A22 *= FLT_SCALE;

                        D = A11 * A22 - A12 * A12;
                        min_eig = (A22 + A11 - Math.sqrt((A11 - A22) * (A11 - A22) + 4.0 * A12 * A12)) / win_area2;

                        if (min_eig < min_eigen_threshold || D < FLT_EPSILON) {
                            if (level == 0) {
                                status[ptid] = 0;
                            }
                            continue;
                        }

                        D = 1.0 / D;

                        next_x -= half_win;
                        next_y -= half_win;
                        prev_delta_x = 0.0;
                        prev_delta_y = 0.0;

                        for (iter = 0; iter < max_iter; ++iter) {
                            inext_x = next_x | 0;
                            inext_y = next_y | 0;

                            x = (inext_x <= brd_tl) | (inext_x >= brd_r) | (inext_y <= brd_tl) | (inext_y >= brd_b);
                            if (x != 0) {
                                if (level == 0) {
                                    status[ptid] = 0;
                                }
                                break;
                            }

                            a = next_x - inext_x;
                            b = next_y - inext_y;
                            iw00 = (((1.0 - a) * (1.0 - b) * W_BITS14_) + 0.5) | 0;
                            iw01 = ((a * (1.0 - b) * W_BITS14_) + 0.5) | 0;
                            iw10 = (((1.0 - a) * b * W_BITS14_) + 0.5) | 0;
                            iw11 = (W_BITS14_ - iw00 - iw01 - iw10);
                            b1 = 0.0, b2 = 0.0;

                            for (y = 0; y < win_size; ++y) {
                                jptr = ((y + inext_y) * lw + inext_x) | 0;

                                iptr = (y * win_size) | 0;
                                diptr = iptr << 1;
                                for (x = 0 ; x < win_size; ++x, ++jptr, ++iptr) {
                                    ival = ((img_next[jptr]) * iw00 + (img_next[jptr + 1]) * iw01 +
                                            (img_next[jptr + lw]) * iw10 + (img_next[jptr + lw + 1]) * iw11);
                                    ival = (((ival) + W_BITS1m51) >> (W_BITS1m5));
                                    ival = (ival - iwin_buf[iptr]);

                                    b1 += ival * deriv_iwin[diptr++];
                                    b2 += ival * deriv_iwin[diptr++];
                                }
                            }

                            b1 *= FLT_SCALE;
                            b2 *= FLT_SCALE;

                            delta_x = ((A12 * b2 - A22 * b1) * D);
                            delta_y = ((A12 * b1 - A11 * b2) * D);

                            next_x += delta_x;
                            next_y += delta_y;
                            curr_xy[i] = next_x + half_win;
                            curr_xy[j] = next_y + half_win;

                            if (delta_x * delta_x + delta_y * delta_y <= eps) {
                                break;
                            }

                            if (iter > 0 && Math.abs(delta_x + prev_delta_x) < 0.01 &&
                                            Math.abs(delta_y + prev_delta_y) < 0.01) {
                                curr_xy[i] -= delta_x * 0.5;
                                curr_xy[j] -= delta_y * 0.5;
                                break;
                            }

                            prev_delta_x = delta_x;
                            prev_delta_y = delta_y;
                        }
                    } // points loop
                } // levels loop

                jsfeat.cache.put_buffer(iwin_node);
                jsfeat.cache.put_buffer(deriv_iwin_node);
                jsfeat.cache.put_buffer(deriv_lev_node);
            }
        };
    })();

    global.optical_flow_lk = optical_flow_lk;

})(jsfeat);
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 *
 * this code is a rewrite from https://github.com/mtschirs/js-objectdetect implementation
 * @author Martin Tschirsich / http://www.tu-darmstadt.de/~m_t
 */

(function (global) {
    "use strict";
    //
    var haar = (function () {

        var _group_func = function (r1, r2) {
            var distance = (r1.width * 0.25 + 0.5) | 0;

            return r2.x <= r1.x + distance &&
                   r2.x >= r1.x - distance &&
                   r2.y <= r1.y + distance &&
                   r2.y >= r1.y - distance &&
                   r2.width <= (r1.width * 1.5 + 0.5) | 0 &&
                   (r2.width * 1.5 + 0.5) | 0 >= r1.width;
        }

        return {

            edges_density: 0.07,

            detect_single_scale: function (int_sum, int_sqsum, int_tilted, int_canny_sum, width, height, scale, classifier) {
                var win_w = (classifier.size[0] * scale) | 0,
                    win_h = (classifier.size[1] * scale) | 0,
                    step_x = (0.5 * scale + 1.5) | 0,
                    step_y = step_x;
                var i, j, k, x, y, ex = (width - win_w) | 0, ey = (height - win_h) | 0;
                var w1 = (width + 1) | 0, edge_dens, mean, variance, std;
                var inv_area = 1.0 / (win_w * win_h);
                var stages, stage, trees, tree, sn, tn, fn, found = true, stage_thresh, stage_sum, tree_sum, feature, features;
                var fi_a, fi_b, fi_c, fi_d, fw, fh;

                var ii_a = 0, ii_b = win_w, ii_c = win_h * w1, ii_d = ii_c + win_w;
                var edges_thresh = ((win_w * win_h) * 0xff * this.edges_density) | 0;
                // if too much gradient we also can skip
                //var edges_thresh_high = ((win_w*win_h) * 0xff * 0.3)|0;

                var rects = [];
                for (y = 0; y < ey; y += step_y) {
                    ii_a = y * w1;
                    for (x = 0; x < ex; x += step_x, ii_a += step_x) {

                        mean = int_sum[ii_a]
                                - int_sum[ii_a + ii_b]
                                - int_sum[ii_a + ii_c]
                                + int_sum[ii_a + ii_d];

                        // canny prune
                        if (int_canny_sum) {
                            edge_dens = (int_canny_sum[ii_a]
                                        - int_canny_sum[ii_a + ii_b]
                                        - int_canny_sum[ii_a + ii_c]
                                        + int_canny_sum[ii_a + ii_d]);
                            if (edge_dens < edges_thresh || mean < 20) {
                                x += step_x, ii_a += step_x;
                                continue;
                            }
                        }

                        mean *= inv_area;
                        variance = (int_sqsum[ii_a]
                                    - int_sqsum[ii_a + ii_b]
                                    - int_sqsum[ii_a + ii_c]
                                    + int_sqsum[ii_a + ii_d]) * inv_area - mean * mean;

                        std = variance > 0. ? Math.sqrt(variance) : 1;

                        stages = classifier.complexClassifiers;
                        sn = stages.length;
                        found = true;
                        for (i = 0; i < sn; ++i) {
                            stage = stages[i];
                            stage_thresh = stage.threshold;
                            trees = stage.simpleClassifiers;
                            tn = trees.length;
                            stage_sum = 0;
                            for (j = 0; j < tn; ++j) {
                                tree = trees[j];
                                tree_sum = 0;
                                features = tree.features;
                                fn = features.length;
                                if (tree.tilted === 1) {
                                    for (k = 0; k < fn; ++k) {
                                        feature = features[k];
                                        fi_a = ~~(x + feature[0] * scale) + ~~(y + feature[1] * scale) * w1;
                                        fw = ~~(feature[2] * scale);
                                        fh = ~~(feature[3] * scale);
                                        fi_b = fw * w1;
                                        fi_c = fh * w1;

                                        tree_sum += (int_tilted[fi_a]
                                                    - int_tilted[fi_a + fw + fi_b]
                                                    - int_tilted[fi_a - fh + fi_c]
                                                    + int_tilted[fi_a + fw - fh + fi_b + fi_c]) * feature[4];
                                    }
                                } else {
                                    for (k = 0; k < fn; ++k) {
                                        feature = features[k];
                                        fi_a = ~~(x + feature[0] * scale) + ~~(y + feature[1] * scale) * w1;
                                        fw = ~~(feature[2] * scale);
                                        fh = ~~(feature[3] * scale);
                                        fi_c = fh * w1;

                                        tree_sum += (int_sum[fi_a]
                                                    - int_sum[fi_a + fw]
                                                    - int_sum[fi_a + fi_c]
                                                    + int_sum[fi_a + fi_c + fw]) * feature[4];
                                    }
                                }
                                stage_sum += (tree_sum * inv_area < tree.threshold * std) ? tree.left_val : tree.right_val;
                            }
                            if (stage_sum < stage_thresh) {
                                found = false;
                                break;
                            }
                        }

                        if (found) {
                            rects.push({
                                "x": x,
                                "y": y,
                                "width": win_w,
                                "height": win_h,
                                "neighbor": 1,
                                "confidence": stage_sum
                            });
                            x += step_x, ii_a += step_x;
                        }
                    }
                }
                return rects;
            },

            detect_multi_scale: function (int_sum, int_sqsum, int_tilted, int_canny_sum, width, height, classifier, scale_factor, scale_min) {
                if (typeof scale_factor === "undefined") { scale_factor = 1.2; }
                if (typeof scale_min === "undefined") { scale_min = 1.0; }
                var win_w = classifier.size[0];
                var win_h = classifier.size[1];
                var rects = [];
                while (scale_min * win_w < width && scale_min * win_h < height) {
                    rects = rects.concat(this.detect_single_scale(int_sum, int_sqsum, int_tilted, int_canny_sum, width, height, scale_min, classifier));
                    scale_min *= scale_factor;
                }
                return rects;
            },

            // OpenCV method to group detected rectangles
            group_rectangles: function (rects, min_neighbors) {
                if (typeof min_neighbors === "undefined") { min_neighbors = 1; }
                var i, j, n = rects.length;
                var node = [];
                for (i = 0; i < n; ++i) {
                    node[i] = {
                        "parent": -1,
                        "element": rects[i],
                        "rank": 0
                    };
                }
                for (i = 0; i < n; ++i) {
                    if (!node[i].element)
                        continue;
                    var root = i;
                    while (node[root].parent != -1)
                        root = node[root].parent;
                    for (j = 0; j < n; ++j) {
                        if (i != j && node[j].element && _group_func(node[i].element, node[j].element)) {
                            var root2 = j;

                            while (node[root2].parent != -1)
                                root2 = node[root2].parent;

                            if (root2 != root) {
                                if (node[root].rank > node[root2].rank)
                                    node[root2].parent = root;
                                else {
                                    node[root].parent = root2;
                                    if (node[root].rank == node[root2].rank)
                                        node[root2].rank++;
                                    root = root2;
                                }

                                /* compress path from node2 to the root: */
                                var temp, node2 = j;
                                while (node[node2].parent != -1) {
                                    temp = node2;
                                    node2 = node[node2].parent;
                                    node[temp].parent = root;
                                }

                                /* compress path from node to the root: */
                                node2 = i;
                                while (node[node2].parent != -1) {
                                    temp = node2;
                                    node2 = node[node2].parent;
                                    node[temp].parent = root;
                                }
                            }
                        }
                    }
                }
                var idx_seq = [];
                var class_idx = 0;
                for (i = 0; i < n; i++) {
                    j = -1;
                    var node1 = i;
                    if (node[node1].element) {
                        while (node[node1].parent != -1)
                            node1 = node[node1].parent;
                        if (node[node1].rank >= 0)
                            node[node1].rank = ~class_idx++;
                        j = ~node[node1].rank;
                    }
                    idx_seq[i] = j;
                }

                var comps = [];
                for (i = 0; i < class_idx + 1; ++i) {
                    comps[i] = {
                        "neighbors": 0,
                        "x": 0,
                        "y": 0,
                        "width": 0,
                        "height": 0,
                        "confidence": 0
                    };
                }

                // count number of neighbors
                for (i = 0; i < n; ++i) {
                    var r1 = rects[i];
                    var idx = idx_seq[i];

                    if (comps[idx].neighbors == 0)
                        comps[idx].confidence = r1.confidence;

                    ++comps[idx].neighbors;

                    comps[idx].x += r1.x;
                    comps[idx].y += r1.y;
                    comps[idx].width += r1.width;
                    comps[idx].height += r1.height;
                    comps[idx].confidence = Math.max(comps[idx].confidence, r1.confidence);
                }

                var seq2 = [];
                // calculate average bounding box
                for (i = 0; i < class_idx; ++i) {
                    n = comps[i].neighbors;
                    if (n >= min_neighbors)
                        seq2.push({
                            "x": (comps[i].x * 2 + n) / (2 * n),
                            "y": (comps[i].y * 2 + n) / (2 * n),
                            "width": (comps[i].width * 2 + n) / (2 * n),
                            "height": (comps[i].height * 2 + n) / (2 * n),
                            "neighbors": comps[i].neighbors,
                            "confidence": comps[i].confidence
                        });
                }

                var result_seq = [];
                n = seq2.length;
                // filter out small face rectangles inside large face rectangles
                for (i = 0; i < n; ++i) {
                    var r1 = seq2[i];
                    var flag = true;
                    for (j = 0; j < n; ++j) {
                        var r2 = seq2[j];
                        var distance = (r2.width * 0.25 + 0.5) | 0;

                        if (i != j &&
                           r1.x >= r2.x - distance &&
                           r1.y >= r2.y - distance &&
                           r1.x + r1.width <= r2.x + r2.width + distance &&
                           r1.y + r1.height <= r2.y + r2.height + distance &&
                           (r2.neighbors > Math.max(3, r1.neighbors) || r1.neighbors < 3)) {
                            flag = false;
                            break;
                        }
                    }

                    if (flag)
                        result_seq.push(r1);
                }
                return result_seq;
            }
        };

    })();

    global.haar = haar;

})(jsfeat);
/**
 * BBF: Brightness Binary Feature
 *
 * @author Eugene Zatepyakin / http://inspirit.ru/
 *
 * this code is a rewrite from https://github.com/liuliu/ccv implementation
 * @author Liu Liu / http://liuliu.me/
 *
 * The original paper refers to: YEF∗ Real-Time Object Detection, Yotam Abramson and Bruno Steux
 */

(function (global) {
    "use strict";
    //
    var bbf = (function () {

        var _group_func = function (r1, r2) {
            var distance = (r1.width * 0.25 + 0.5) | 0;

            return r2.x <= r1.x + distance &&
                   r2.x >= r1.x - distance &&
                   r2.y <= r1.y + distance &&
                   r2.y >= r1.y - distance &&
                   r2.width <= (r1.width * 1.5 + 0.5) | 0 &&
                   (r2.width * 1.5 + 0.5) | 0 >= r1.width;
        }

        var img_pyr = new jsfeat.pyramid_t(1);

        return {

            interval: 4,
            scale: 1.1486,
            next: 5,
            scale_to: 1,

            // make features local copy
            // to avoid array allocation with each scale
            // this is strange but array works faster than Int32 version???
            prepare_cascade: function (cascade) {
                var sn = cascade.stage_classifier.length;
                for (var j = 0; j < sn; j++) {
                    var orig_feature = cascade.stage_classifier[j].feature;
                    var f_cnt = cascade.stage_classifier[j].count;
                    var feature = cascade.stage_classifier[j]._feature = new Array(f_cnt);
                    for (var k = 0; k < f_cnt; k++) {
                        feature[k] = {
                            "size": orig_feature[k].size,
                            "px": new Array(orig_feature[k].size),
                            "pz": new Array(orig_feature[k].size),
                            "nx": new Array(orig_feature[k].size),
                            "nz": new Array(orig_feature[k].size)
                        };
                    }
                }
            },

            build_pyramid: function (src, min_width, min_height, interval) {
                if (typeof interval === "undefined") { interval = 4; }

                var sw = src.cols, sh = src.rows;
                var i = 0, nw = 0, nh = 0;
                var new_pyr = false;
                var src0 = src, src1 = src;
                var data_type = jsfeat.U8_t | jsfeat.C1_t;

                this.interval = interval;
                this.scale = Math.pow(2, 1 / (this.interval + 1));
                this.next = (this.interval + 1) | 0;
                this.scale_to = (Math.log(Math.min(sw / min_width, sh / min_height)) / Math.log(this.scale)) | 0;

                var pyr_l = ((this.scale_to + this.next * 2) * 4) | 0;
                if (img_pyr.levels != pyr_l) {
                    img_pyr.levels = pyr_l;
                    img_pyr.data = new Array(pyr_l);
                    new_pyr = true;
                    img_pyr.data[0] = src; // first is src
                }

                for (i = 1; i <= this.interval; ++i) {
                    nw = (sw / Math.pow(this.scale, i)) | 0;
                    nh = (sh / Math.pow(this.scale, i)) | 0;
                    src0 = img_pyr.data[i << 2];
                    if (new_pyr || nw != src0.cols || nh != src0.rows) {
                        img_pyr.data[i << 2] = new jsfeat.matrix_t(nw, nh, data_type);
                        src0 = img_pyr.data[i << 2];
                    }
                    jsfeat.imgproc.resample(src, src0, nw, nh);
                }
                for (i = this.next; i < this.scale_to + this.next * 2; ++i) {
                    src1 = img_pyr.data[(i << 2) - (this.next << 2)];
                    src0 = img_pyr.data[i << 2];
                    nw = src1.cols >> 1;
                    nh = src1.rows >> 1;
                    if (new_pyr || nw != src0.cols || nh != src0.rows) {
                        img_pyr.data[i << 2] = new jsfeat.matrix_t(nw, nh, data_type);
                        src0 = img_pyr.data[i << 2];
                    }
                    jsfeat.imgproc.pyrdown(src1, src0);
                }
                for (i = this.next * 2; i < this.scale_to + this.next * 2; ++i) {
                    src1 = img_pyr.data[(i << 2) - (this.next << 2)];
                    nw = src1.cols >> 1;
                    nh = src1.rows >> 1;
                    src0 = img_pyr.data[(i << 2) + 1];
                    if (new_pyr || nw != src0.cols || nh != src0.rows) {
                        img_pyr.data[(i << 2) + 1] = new jsfeat.matrix_t(nw, nh, data_type);
                        src0 = img_pyr.data[(i << 2) + 1];
                    }
                    jsfeat.imgproc.pyrdown(src1, src0, 1, 0);
                    //
                    src0 = img_pyr.data[(i << 2) + 2];
                    if (new_pyr || nw != src0.cols || nh != src0.rows) {
                        img_pyr.data[(i << 2) + 2] = new jsfeat.matrix_t(nw, nh, data_type);
                        src0 = img_pyr.data[(i << 2) + 2];
                    }
                    jsfeat.imgproc.pyrdown(src1, src0, 0, 1);
                    //
                    src0 = img_pyr.data[(i << 2) + 3];
                    if (new_pyr || nw != src0.cols || nh != src0.rows) {
                        img_pyr.data[(i << 2) + 3] = new jsfeat.matrix_t(nw, nh, data_type);
                        src0 = img_pyr.data[(i << 2) + 3];
                    }
                    jsfeat.imgproc.pyrdown(src1, src0, 1, 1);
                }
                return img_pyr;
            },

            detect: function (pyramid, cascade) {
                var interval = this.interval;
                var scale = this.scale;
                var next = this.next;
                var scale_upto = this.scale_to;
                var i = 0, j = 0, k = 0, n = 0, x = 0, y = 0, q = 0, sn = 0, f_cnt = 0, q_cnt = 0, p = 0, pmin = 0, nmax = 0, f = 0, i4 = 0, qw = 0, qh = 0;
                var sum = 0.0, alpha, feature, orig_feature, feature_k, feature_o, flag = true, shortcut = true;
                var scale_x = 1.0, scale_y = 1.0;
                var dx = [0, 1, 0, 1];
                var dy = [0, 0, 1, 1];
                var seq = [];
                var pyr = pyramid.data, bpp = 1, bpp2 = 2, bpp4 = 4;

                var u8 = [], u8o = [0, 0, 0];
                var step = [0, 0, 0];
                var paddings = [0, 0, 0];

                for (i = 0; i < scale_upto; i++) {
                    i4 = (i << 2);
                    qw = pyr[i4 + (next << 3)].cols - (cascade.width >> 2);
                    qh = pyr[i4 + (next << 3)].rows - (cascade.height >> 2);
                    step[0] = pyr[i4].cols * bpp;
                    step[1] = pyr[i4 + (next << 2)].cols * bpp;
                    step[2] = pyr[i4 + (next << 3)].cols * bpp;
                    paddings[0] = (pyr[i4].cols * bpp4) - (qw * bpp4);
                    paddings[1] = (pyr[i4 + (next << 2)].cols * bpp2) - (qw * bpp2);
                    paddings[2] = (pyr[i4 + (next << 3)].cols * bpp) - (qw * bpp);
                    sn = cascade.stage_classifier.length;
                    for (j = 0; j < sn; j++) {
                        orig_feature = cascade.stage_classifier[j].feature;
                        feature = cascade.stage_classifier[j]._feature;
                        f_cnt = cascade.stage_classifier[j].count;
                        for (k = 0; k < f_cnt; k++) {
                            feature_k = feature[k];
                            feature_o = orig_feature[k];
                            q_cnt = feature_o.size | 0;
                            for (q = 0; q < q_cnt; q++) {
                                feature_k.px[q] = (feature_o.px[q] * bpp) + feature_o.py[q] * step[feature_o.pz[q]];
                                feature_k.pz[q] = feature_o.pz[q];
                                feature_k.nx[q] = (feature_o.nx[q] * bpp) + feature_o.ny[q] * step[feature_o.nz[q]];
                                feature_k.nz[q] = feature_o.nz[q];
                            }
                        }
                    }
                    u8[0] = pyr[i4].data; u8[1] = pyr[i4 + (next << 2)].data;
                    for (q = 0; q < 4; q++) {
                        u8[2] = pyr[i4 + (next << 3) + q].data;
                        u8o[0] = (dx[q] * bpp2) + dy[q] * (pyr[i4].cols * bpp2);
                        u8o[1] = (dx[q] * bpp) + dy[q] * (pyr[i4 + (next << 2)].cols * bpp);
                        u8o[2] = 0;
                        for (y = 0; y < qh; y++) {
                            for (x = 0; x < qw; x++) {
                                sum = 0;
                                flag = true;
                                sn = cascade.stage_classifier.length;
                                for (j = 0; j < sn; j++) {
                                    sum = 0;
                                    alpha = cascade.stage_classifier[j].alpha;
                                    feature = cascade.stage_classifier[j]._feature;
                                    f_cnt = cascade.stage_classifier[j].count;
                                    for (k = 0; k < f_cnt; k++) {
                                        feature_k = feature[k];
                                        pmin = u8[feature_k.pz[0]][u8o[feature_k.pz[0]] + feature_k.px[0]];
                                        nmax = u8[feature_k.nz[0]][u8o[feature_k.nz[0]] + feature_k.nx[0]];
                                        if (pmin <= nmax) {
                                            sum += alpha[k << 1];
                                        } else {
                                            shortcut = true;
                                            q_cnt = feature_k.size;
                                            for (f = 1; f < q_cnt; f++) {
                                                if (feature_k.pz[f] >= 0) {
                                                    p = u8[feature_k.pz[f]][u8o[feature_k.pz[f]] + feature_k.px[f]];
                                                    if (p < pmin) {
                                                        if (p <= nmax) {
                                                            shortcut = false;
                                                            break;
                                                        }
                                                        pmin = p;
                                                    }
                                                }
                                                if (feature_k.nz[f] >= 0) {
                                                    n = u8[feature_k.nz[f]][u8o[feature_k.nz[f]] + feature_k.nx[f]];
                                                    if (n > nmax) {
                                                        if (pmin <= n) {
                                                            shortcut = false;
                                                            break;
                                                        }
                                                        nmax = n;
                                                    }
                                                }
                                            }
                                            sum += (shortcut) ? alpha[(k << 1) + 1] : alpha[k << 1];
                                        }
                                    }
                                    if (sum < cascade.stage_classifier[j].threshold) {
                                        flag = false;
                                        break;
                                    }
                                }
                                if (flag) {
                                    seq.push({
                                        "x": (x * 4 + dx[q] * 2) * scale_x,
                                        "y": (y * 4 + dy[q] * 2) * scale_y,
                                        "width": cascade.width * scale_x,
                                        "height": cascade.height * scale_y,
                                        "neighbor": 1,
                                        "confidence": sum
                                    });
                                    ++x;
                                    u8o[0] += bpp4;
                                    u8o[1] += bpp2;
                                    u8o[2] += bpp;
                                }
                                u8o[0] += bpp4;
                                u8o[1] += bpp2;
                                u8o[2] += bpp;
                            }
                            u8o[0] += paddings[0];
                            u8o[1] += paddings[1];
                            u8o[2] += paddings[2];
                        }
                    }
                    scale_x *= scale;
                    scale_y *= scale;
                }

                return seq;
            },

            // OpenCV method to group detected rectangles
            group_rectangles: function (rects, min_neighbors) {
                if (typeof min_neighbors === "undefined") { min_neighbors = 1; }
                var i, j, n = rects.length;
                var node = [];
                for (i = 0; i < n; ++i) {
                    node[i] = {
                        "parent": -1,
                        "element": rects[i],
                        "rank": 0
                    };
                }
                for (i = 0; i < n; ++i) {
                    if (!node[i].element)
                        continue;
                    var root = i;
                    while (node[root].parent != -1)
                        root = node[root].parent;
                    for (j = 0; j < n; ++j) {
                        if (i != j && node[j].element && _group_func(node[i].element, node[j].element)) {
                            var root2 = j;

                            while (node[root2].parent != -1)
                                root2 = node[root2].parent;

                            if (root2 != root) {
                                if (node[root].rank > node[root2].rank)
                                    node[root2].parent = root;
                                else {
                                    node[root].parent = root2;
                                    if (node[root].rank == node[root2].rank)
                                        node[root2].rank++;
                                    root = root2;
                                }

                                /* compress path from node2 to the root: */
                                var temp, node2 = j;
                                while (node[node2].parent != -1) {
                                    temp = node2;
                                    node2 = node[node2].parent;
                                    node[temp].parent = root;
                                }

                                /* compress path from node to the root: */
                                node2 = i;
                                while (node[node2].parent != -1) {
                                    temp = node2;
                                    node2 = node[node2].parent;
                                    node[temp].parent = root;
                                }
                            }
                        }
                    }
                }
                var idx_seq = [];
                var class_idx = 0;
                for (i = 0; i < n; i++) {
                    j = -1;
                    var node1 = i;
                    if (node[node1].element) {
                        while (node[node1].parent != -1)
                            node1 = node[node1].parent;
                        if (node[node1].rank >= 0)
                            node[node1].rank = ~class_idx++;
                        j = ~node[node1].rank;
                    }
                    idx_seq[i] = j;
                }

                var comps = [];
                for (i = 0; i < class_idx + 1; ++i) {
                    comps[i] = {
                        "neighbors": 0,
                        "x": 0,
                        "y": 0,
                        "width": 0,
                        "height": 0,
                        "confidence": 0
                    };
                }

                // count number of neighbors
                for (i = 0; i < n; ++i) {
                    var r1 = rects[i];
                    var idx = idx_seq[i];

                    if (comps[idx].neighbors == 0)
                        comps[idx].confidence = r1.confidence;

                    ++comps[idx].neighbors;

                    comps[idx].x += r1.x;
                    comps[idx].y += r1.y;
                    comps[idx].width += r1.width;
                    comps[idx].height += r1.height;
                    comps[idx].confidence = Math.max(comps[idx].confidence, r1.confidence);
                }

                var seq2 = [];
                // calculate average bounding box
                for (i = 0; i < class_idx; ++i) {
                    n = comps[i].neighbors;
                    if (n >= min_neighbors)
                        seq2.push({
                            "x": (comps[i].x * 2 + n) / (2 * n),
                            "y": (comps[i].y * 2 + n) / (2 * n),
                            "width": (comps[i].width * 2 + n) / (2 * n),
                            "height": (comps[i].height * 2 + n) / (2 * n),
                            "neighbors": comps[i].neighbors,
                            "confidence": comps[i].confidence
                        });
                }

                var result_seq = [];
                n = seq2.length;
                // filter out small face rectangles inside large face rectangles
                for (i = 0; i < n; ++i) {
                    var r1 = seq2[i];
                    var flag = true;
                    for (j = 0; j < n; ++j) {
                        var r2 = seq2[j];
                        var distance = (r2.width * 0.25 + 0.5) | 0;

                        if (i != j &&
                           r1.x >= r2.x - distance &&
                           r1.y >= r2.y - distance &&
                           r1.x + r1.width <= r2.x + r2.width + distance &&
                           r1.y + r1.height <= r2.y + r2.height + distance &&
                           (r2.neighbors > Math.max(3, r1.neighbors) || r1.neighbors < 3)) {
                            flag = false;
                            break;
                        }
                    }

                    if (flag)
                        result_seq.push(r1);
                }
                return result_seq;
            }

        };

    })();

    global.bbf = bbf;

})(jsfeat);
/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 */

/**
 * this cascade is derived from https://github.com/mtschirs/js-objectdetect implementation
 * @author Martin Tschirsich / http://www.tu-darmstadt.de/~m_t
 */
(function (global) {
    global.frontalface = { complexClassifiers: [{ simpleClassifiers: [{ features: [[3, 7, 14, 4, -1.], [3, 9, 14, 2, 2.]], threshold: 4.0141958743333817e-003, right_val: 0.8378106951713562, left_val: 0.0337941907346249 }, { features: [[1, 2, 18, 4, -1.], [7, 2, 6, 4, 3.]], threshold: 0.0151513395830989, right_val: 0.7488812208175659, left_val: 0.1514132022857666 }, { features: [[1, 7, 15, 9, -1.], [1, 10, 15, 3, 3.]], threshold: 4.2109931819140911e-003, right_val: 0.6374819874763489, left_val: 0.0900492817163467 }], threshold: 0.8226894140243530 }, { simpleClassifiers: [{ features: [[5, 6, 2, 6, -1.], [5, 9, 2, 3, 2.]], threshold: 1.6227109590545297e-003, right_val: 0.7110946178436279, left_val: 0.0693085864186287 }, { features: [[7, 5, 6, 3, -1.], [9, 5, 2, 3, 3.]], threshold: 2.2906649392098188e-003, right_val: 0.6668692231178284, left_val: 0.1795803010463715 }, { features: [[4, 0, 12, 9, -1.], [4, 3, 12, 3, 3.]], threshold: 5.0025708042085171e-003, right_val: 0.6554006934165955, left_val: 0.1693672984838486 }, { features: [[6, 9, 10, 8, -1.], [6, 13, 10, 4, 2.]], threshold: 7.9659894108772278e-003, right_val: 0.0914145186543465, left_val: 0.5866332054138184 }, { features: [[3, 6, 14, 8, -1.], [3, 10, 14, 4, 2.]], threshold: -3.5227010957896709e-003, right_val: 0.6031895875930786, left_val: 0.1413166970014572 }, { features: [[14, 1, 6, 10, -1.], [14, 1, 3, 10, 2.]], threshold: 0.0366676896810532, right_val: 0.7920318245887756, left_val: 0.3675672113895416 }, { features: [[7, 8, 5, 12, -1.], [7, 12, 5, 4, 3.]], threshold: 9.3361474573612213e-003, right_val: 0.2088509947061539, left_val: 0.6161385774612427 }, { features: [[1, 1, 18, 3, -1.], [7, 1, 6, 3, 3.]], threshold: 8.6961314082145691e-003, right_val: 0.6360273957252502, left_val: 0.2836230993270874 }, { features: [[1, 8, 17, 2, -1.], [1, 9, 17, 1, 2.]], threshold: 1.1488880263641477e-003, right_val: 0.5800700783729553, left_val: 0.2223580926656723 }, { features: [[16, 6, 4, 2, -1.], [16, 7, 4, 1, 2.]], threshold: -2.1484689787030220e-003, right_val: 0.5787054896354675, left_val: 0.2406464070081711 }, { features: [[5, 17, 2, 2, -1.], [5, 18, 2, 1, 2.]], threshold: 2.1219060290604830e-003, right_val: 0.1362237036228180, left_val: 0.5559654831886292 }, { features: [[14, 2, 6, 12, -1.], [14, 2, 3, 12, 2.]], threshold: -0.0939491465687752, right_val: 0.4717740118503571, left_val: 0.8502737283706665 }, { features: [[4, 0, 4, 12, -1.], [4, 0, 2, 6, 2.], [6, 6, 2, 6, 2.]], threshold: 1.3777789426967502e-003, right_val: 0.2834529876708984, left_val: 0.5993673801422119 }, { features: [[2, 11, 18, 8, -1.], [8, 11, 6, 8, 3.]], threshold: 0.0730631574988365, right_val: 0.7060034275054932, left_val: 0.4341886043548584 }, { features: [[5, 7, 10, 2, -1.], [5, 8, 10, 1, 2.]], threshold: 3.6767389974556863e-004, right_val: 0.6051574945449829, left_val: 0.3027887940406799 }, { features: [[15, 11, 5, 3, -1.], [15, 12, 5, 1, 3.]], threshold: -6.0479710809886456e-003, right_val: 0.5675256848335266, left_val: 0.1798433959484100 }], threshold: 6.9566087722778320 }, { simpleClassifiers: [{ features: [[5, 3, 10, 9, -1.], [5, 6, 10, 3, 3.]], threshold: -0.0165106896311045, right_val: 0.1424857974052429, left_val: 0.6644225120544434 }, { features: [[9, 4, 2, 14, -1.], [9, 11, 2, 7, 2.]], threshold: 2.7052499353885651e-003, right_val: 0.1288477033376694, left_val: 0.6325352191925049 }, { features: [[3, 5, 4, 12, -1.], [3, 9, 4, 4, 3.]], threshold: 2.8069869149476290e-003, right_val: 0.6193193197250366, left_val: 0.1240288019180298 }, { features: [[4, 5, 12, 5, -1.], [8, 5, 4, 5, 3.]], threshold: -1.5402400167658925e-003, right_val: 0.5670015811920166, left_val: 0.1432143002748489 }, { features: [[5, 6, 10, 8, -1.], [5, 10, 10, 4, 2.]], threshold: -5.6386279175058007e-004, right_val: 0.5905207991600037, left_val: 0.1657433062791824 }, { features: [[8, 0, 6, 9, -1.], [8, 3, 6, 3, 3.]], threshold: 1.9253729842603207e-003, right_val: 0.5738824009895325, left_val: 0.2695507109165192 }, { features: [[9, 12, 1, 8, -1.], [9, 16, 1, 4, 2.]], threshold: -5.0214841030538082e-003, right_val: 0.5782774090766907, left_val: 0.1893538981676102 }, { features: [[0, 7, 20, 6, -1.], [0, 9, 20, 2, 3.]], threshold: 2.6365420781075954e-003, right_val: 0.5695425868034363, left_val: 0.2309329062700272 }, { features: [[7, 0, 6, 17, -1.], [9, 0, 2, 17, 3.]], threshold: -1.5127769438549876e-003, right_val: 0.5956642031669617, left_val: 0.2759602069854736 }, { features: [[9, 0, 6, 4, -1.], [11, 0, 2, 4, 3.]], threshold: -0.0101574398577213, right_val: 0.5522047281265259, left_val: 0.1732538044452667 }, { features: [[5, 1, 6, 4, -1.], [7, 1, 2, 4, 3.]], threshold: -0.0119536602869630, right_val: 0.5559014081954956, left_val: 0.1339409947395325 }, { features: [[12, 1, 6, 16, -1.], [14, 1, 2, 16, 3.]], threshold: 4.8859491944313049e-003, right_val: 0.6188849210739136, left_val: 0.3628703951835632 }, { features: [[0, 5, 18, 8, -1.], [0, 5, 9, 4, 2.], [9, 9, 9, 4, 2.]], threshold: -0.0801329165697098, right_val: 0.5475944876670837, left_val: 0.0912110507488251 }, { features: [[8, 15, 10, 4, -1.], [13, 15, 5, 2, 2.], [8, 17, 5, 2, 2.]], threshold: 1.0643280111253262e-003, right_val: 0.5711399912834168, left_val: 0.3715142905712128 }, { features: [[3, 1, 4, 8, -1.], [3, 1, 2, 4, 2.], [5, 5, 2, 4, 2.]], threshold: -1.3419450260698795e-003, right_val: 0.3318097889423370, left_val: 0.5953313708305359 }, { features: [[3, 6, 14, 10, -1.], [10, 6, 7, 5, 2.], [3, 11, 7, 5, 2.]], threshold: -0.0546011403203011, right_val: 0.5602846145629883, left_val: 0.1844065934419632 }, { features: [[2, 1, 6, 16, -1.], [4, 1, 2, 16, 3.]], threshold: 2.9071690514683723e-003, right_val: 0.6131715178489685, left_val: 0.3594244122505188 }, { features: [[0, 18, 20, 2, -1.], [0, 19, 20, 1, 2.]], threshold: 7.4718717951327562e-004, right_val: 0.3459562957286835, left_val: 0.5994353294372559 }, { features: [[8, 13, 4, 3, -1.], [8, 14, 4, 1, 3.]], threshold: 4.3013808317482471e-003, right_val: 0.6990845203399658, left_val: 0.4172652065753937 }, { features: [[9, 14, 2, 3, -1.], [9, 15, 2, 1, 3.]], threshold: 4.5017572119832039e-003, right_val: 0.7801457047462463, left_val: 0.4509715139865875 }, { features: [[0, 12, 9, 6, -1.], [0, 14, 9, 2, 3.]], threshold: 0.0241385009139776, right_val: 0.1319826990365982, left_val: 0.5438212752342224 }], threshold: 9.4985427856445313 }, { simpleClassifiers: [{ features: [[5, 7, 3, 4, -1.], [5, 9, 3, 2, 2.]], threshold: 1.9212230108678341e-003, right_val: 0.6199870705604553, left_val: 0.1415266990661621 }, { features: [[9, 3, 2, 16, -1.], [9, 11, 2, 8, 2.]], threshold: -1.2748669541906565e-004, right_val: 0.1884928941726685, left_val: 0.6191074252128601 }, { features: [[3, 6, 13, 8, -1.], [3, 10, 13, 4, 2.]], threshold: 5.1409931620582938e-004, right_val: 0.5857927799224854, left_val: 0.1487396955490112 }, { features: [[12, 3, 8, 2, -1.], [12, 3, 4, 2, 2.]], threshold: 4.1878609918057919e-003, right_val: 0.6359239816665649, left_val: 0.2746909856796265 }, { features: [[8, 8, 4, 12, -1.], [8, 12, 4, 4, 3.]], threshold: 5.1015717908740044e-003, right_val: 0.2175628989934921, left_val: 0.5870851278305054 }, { features: [[11, 3, 8, 6, -1.], [15, 3, 4, 3, 2.], [11, 6, 4, 3, 2.]], threshold: -2.1448440384119749e-003, right_val: 0.2979590892791748, left_val: 0.5880944728851318 }, { features: [[7, 1, 6, 19, -1.], [9, 1, 2, 19, 3.]], threshold: -2.8977119363844395e-003, right_val: 0.5876647233963013, left_val: 0.2373327016830444 }, { features: [[9, 0, 6, 4, -1.], [11, 0, 2, 4, 3.]], threshold: -0.0216106791049242, right_val: 0.5194202065467835, left_val: 0.1220654994249344 }, { features: [[3, 1, 9, 3, -1.], [6, 1, 3, 3, 3.]], threshold: -4.6299318782985210e-003, right_val: 0.5817409157752991, left_val: 0.2631230950355530 }, { features: [[8, 15, 10, 4, -1.], [13, 15, 5, 2, 2.], [8, 17, 5, 2, 2.]], threshold: 5.9393711853772402e-004, right_val: 0.5698544979095459, left_val: 0.3638620078563690 }, { features: [[0, 3, 6, 10, -1.], [3, 3, 3, 10, 2.]], threshold: 0.0538786612451077, right_val: 0.7559366226196289, left_val: 0.4303531050682068 }, { features: [[3, 4, 15, 15, -1.], [3, 9, 15, 5, 3.]], threshold: 1.8887349870055914e-003, right_val: 0.5613427162170410, left_val: 0.2122603058815002 }, { features: [[6, 5, 8, 6, -1.], [6, 7, 8, 2, 3.]], threshold: -2.3635339457541704e-003, right_val: 0.2642767131328583, left_val: 0.5631849169731140 }, { features: [[4, 4, 12, 10, -1.], [10, 4, 6, 5, 2.], [4, 9, 6, 5, 2.]], threshold: 0.0240177996456623, right_val: 0.2751705944538117, left_val: 0.5797107815742493 }, { features: [[6, 4, 4, 4, -1.], [8, 4, 2, 4, 2.]], threshold: 2.0543030404951423e-004, right_val: 0.5752568840980530, left_val: 0.2705242037773132 }, { features: [[15, 11, 1, 2, -1.], [15, 12, 1, 1, 2.]], threshold: 8.4790197433903813e-004, right_val: 0.2334876954555512, left_val: 0.5435624718666077 }, { features: [[3, 11, 2, 2, -1.], [3, 12, 2, 1, 2.]], threshold: 1.4091329649090767e-003, right_val: 0.2063155025243759, left_val: 0.5319424867630005 }, { features: [[16, 11, 1, 3, -1.], [16, 12, 1, 1, 3.]], threshold: 1.4642629539594054e-003, right_val: 0.3068861067295075, left_val: 0.5418980717658997 }, { features: [[3, 15, 6, 4, -1.], [3, 15, 3, 2, 2.], [6, 17, 3, 2, 2.]], threshold: 1.6352549428120255e-003, right_val: 0.6112868189811707, left_val: 0.3695372939109802 }, { features: [[6, 7, 8, 2, -1.], [6, 8, 8, 1, 2.]], threshold: 8.3172752056270838e-004, right_val: 0.6025236248970032, left_val: 0.3565036952495575 }, { features: [[3, 11, 1, 3, -1.], [3, 12, 1, 1, 3.]], threshold: -2.0998890977352858e-003, right_val: 0.5362827181816101, left_val: 0.1913982033729553 }, { features: [[6, 0, 12, 2, -1.], [6, 1, 12, 1, 2.]], threshold: -7.4213981861248612e-004, right_val: 0.5529310107231140, left_val: 0.3835555016994476 }, { features: [[9, 14, 2, 3, -1.], [9, 15, 2, 1, 3.]], threshold: 3.2655049581080675e-003, right_val: 0.7101895809173584, left_val: 0.4312896132469177 }, { features: [[7, 15, 6, 2, -1.], [7, 16, 6, 1, 2.]], threshold: 8.9134991867467761e-004, right_val: 0.6391963958740234, left_val: 0.3984830975532532 }, { features: [[0, 5, 4, 6, -1.], [0, 7, 4, 2, 3.]], threshold: -0.0152841797098517, right_val: 0.5433713793754578, left_val: 0.2366732954978943 }, { features: [[4, 12, 12, 2, -1.], [8, 12, 4, 2, 3.]], threshold: 4.8381411470472813e-003, right_val: 0.3239189088344574, left_val: 0.5817500948905945 }, { features: [[6, 3, 1, 9, -1.], [6, 6, 1, 3, 3.]], threshold: -9.1093179071322083e-004, right_val: 0.2911868989467621, left_val: 0.5540593862533569 }, { features: [[10, 17, 3, 2, -1.], [11, 17, 1, 2, 3.]], threshold: -6.1275060288608074e-003, right_val: 0.5196629166603088, left_val: 0.1775255054235458 }, { features: [[9, 9, 2, 2, -1.], [9, 10, 2, 1, 2.]], threshold: -4.4576259097084403e-004, right_val: 0.5533593893051148, left_val: 0.3024170100688934 }, { features: [[7, 6, 6, 4, -1.], [9, 6, 2, 4, 3.]], threshold: 0.0226465407758951, right_val: 0.6975377202033997, left_val: 0.4414930939674377 }, { features: [[7, 17, 3, 2, -1.], [8, 17, 1, 2, 3.]], threshold: -1.8804960418492556e-003, right_val: 0.5497952103614807, left_val: 0.2791394889354706 }, { features: [[10, 17, 3, 3, -1.], [11, 17, 1, 3, 3.]], threshold: 7.0889107882976532e-003, right_val: 0.2385547012090683, left_val: 0.5263199210166931 }, { features: [[8, 12, 3, 2, -1.], [8, 13, 3, 1, 2.]], threshold: 1.7318050377070904e-003, right_val: 0.6983600854873657, left_val: 0.4319379031658173 }, { features: [[9, 3, 6, 2, -1.], [11, 3, 2, 2, 3.]], threshold: -6.8482700735330582e-003, right_val: 0.5390920042991638, left_val: 0.3082042932510376 }, { features: [[3, 11, 14, 4, -1.], [3, 13, 14, 2, 2.]], threshold: -1.5062530110299122e-005, right_val: 0.3120366036891937, left_val: 0.5521922111511231 }, { features: [[1, 10, 18, 4, -1.], [10, 10, 9, 2, 2.], [1, 12, 9, 2, 2.]], threshold: 0.0294755697250366, right_val: 0.1770603060722351, left_val: 0.5401322841644287 }, { features: [[0, 10, 3, 3, -1.], [0, 11, 3, 1, 3.]], threshold: 8.1387329846620560e-003, right_val: 0.1211019009351730, left_val: 0.5178617835044861 }, { features: [[9, 1, 6, 6, -1.], [11, 1, 2, 6, 3.]], threshold: 0.0209429506212473, right_val: 0.3311221897602081, left_val: 0.5290294289588928 }, { features: [[8, 7, 3, 6, -1.], [9, 7, 1, 6, 3.]], threshold: -9.5665529370307922e-003, right_val: 0.4451968967914581, left_val: 0.7471994161605835 }], threshold: 18.4129695892333980 }, { simpleClassifiers: [{ features: [[1, 0, 18, 9, -1.], [1, 3, 18, 3, 3.]], threshold: -2.8206960996612906e-004, right_val: 0.6076732277870178, left_val: 0.2064086049795151 }, { features: [[12, 10, 2, 6, -1.], [12, 13, 2, 3, 2.]], threshold: 1.6790600493550301e-003, right_val: 0.1255383938550949, left_val: 0.5851997137069702 }, { features: [[0, 5, 19, 8, -1.], [0, 9, 19, 4, 2.]], threshold: 6.9827912375330925e-004, right_val: 0.5728961229324341, left_val: 0.0940184295177460 }, { features: [[7, 0, 6, 9, -1.], [9, 0, 2, 9, 3.]], threshold: 7.8959012171253562e-004, right_val: 0.5694308876991272, left_val: 0.1781987994909287 }, { features: [[5, 3, 6, 1, -1.], [7, 3, 2, 1, 3.]], threshold: -2.8560499195009470e-003, right_val: 0.5788664817810059, left_val: 0.1638399064540863 }, { features: [[11, 3, 6, 1, -1.], [13, 3, 2, 1, 3.]], threshold: -3.8122469559311867e-003, right_val: 0.5508564710617065, left_val: 0.2085440009832382 }, { features: [[5, 10, 4, 6, -1.], [5, 13, 4, 3, 2.]], threshold: 1.5896620461717248e-003, right_val: 0.1857215017080307, left_val: 0.5702760815620422 }, { features: [[11, 3, 6, 1, -1.], [13, 3, 2, 1, 3.]], threshold: 0.0100783398374915, right_val: 0.2189770042896271, left_val: 0.5116943120956421 }, { features: [[4, 4, 12, 6, -1.], [4, 6, 12, 2, 3.]], threshold: -0.0635263025760651, right_val: 0.4043813049793243, left_val: 0.7131379842758179 }, { features: [[15, 12, 2, 6, -1.], [15, 14, 2, 2, 3.]], threshold: -9.1031491756439209e-003, right_val: 0.5463973283767700, left_val: 0.2567181885242462 }, { features: [[9, 3, 2, 2, -1.], [10, 3, 1, 2, 2.]], threshold: -2.4035000242292881e-003, right_val: 0.5590974092483521, left_val: 0.1700665950775147 }, { features: [[9, 3, 3, 1, -1.], [10, 3, 1, 1, 3.]], threshold: 1.5226360410451889e-003, right_val: 0.2619054019451141, left_val: 0.5410556793212891 }, { features: [[1, 1, 4, 14, -1.], [3, 1, 2, 14, 2.]], threshold: 0.0179974399507046, right_val: 0.6535220742225647, left_val: 0.3732436895370483 }, { features: [[9, 0, 4, 4, -1.], [11, 0, 2, 2, 2.], [9, 2, 2, 2, 2.]], threshold: -6.4538191072642803e-003, right_val: 0.5537446141242981, left_val: 0.2626481950283051 }, { features: [[7, 5, 1, 14, -1.], [7, 12, 1, 7, 2.]], threshold: -0.0118807600811124, right_val: 0.5544745922088623, left_val: 0.2003753930330277 }, { features: [[19, 0, 1, 4, -1.], [19, 2, 1, 2, 2.]], threshold: 1.2713660253211856e-003, right_val: 0.3031975924968720, left_val: 0.5591902732849121 }, { features: [[5, 5, 6, 4, -1.], [8, 5, 3, 4, 2.]], threshold: 1.1376109905540943e-003, right_val: 0.5646508932113648, left_val: 0.2730407118797302 }, { features: [[9, 18, 3, 2, -1.], [10, 18, 1, 2, 3.]], threshold: -4.2651998810470104e-003, right_val: 0.5461820960044861, left_val: 0.1405909061431885 }, { features: [[8, 18, 3, 2, -1.], [9, 18, 1, 2, 3.]], threshold: -2.9602861031889915e-003, right_val: 0.5459290146827698, left_val: 0.1795035004615784 }, { features: [[4, 5, 12, 6, -1.], [4, 7, 12, 2, 3.]], threshold: -8.8448226451873779e-003, right_val: 0.2809219956398010, left_val: 0.5736783146858215 }, { features: [[3, 12, 2, 6, -1.], [3, 14, 2, 2, 3.]], threshold: -6.6430689767003059e-003, right_val: 0.5503826141357422, left_val: 0.2370675951242447 }, { features: [[10, 8, 2, 12, -1.], [10, 12, 2, 4, 3.]], threshold: 3.9997808635234833e-003, right_val: 0.3304282128810883, left_val: 0.5608199834823608 }, { features: [[7, 18, 3, 2, -1.], [8, 18, 1, 2, 3.]], threshold: -4.1221720166504383e-003, right_val: 0.5378993153572083, left_val: 0.1640105992555618 }, { features: [[9, 0, 6, 2, -1.], [11, 0, 2, 2, 3.]], threshold: 0.0156249096617103, right_val: 0.2288603931665421, left_val: 0.5227649211883545 }, { features: [[5, 11, 9, 3, -1.], [5, 12, 9, 1, 3.]], threshold: -0.0103564197197557, right_val: 0.4252927899360657, left_val: 0.7016193866729736 }, { features: [[9, 0, 6, 2, -1.], [11, 0, 2, 2, 3.]], threshold: -8.7960809469223022e-003, right_val: 0.5355830192565918, left_val: 0.2767347097396851 }, { features: [[1, 1, 18, 5, -1.], [7, 1, 6, 5, 3.]], threshold: 0.1622693985700607, right_val: 0.7442579269409180, left_val: 0.4342240095138550 }, { features: [[8, 0, 4, 4, -1.], [10, 0, 2, 2, 2.], [8, 2, 2, 2, 2.]], threshold: 4.5542530715465546e-003, right_val: 0.2582125067710877, left_val: 0.5726485848426819 }, { features: [[3, 12, 1, 3, -1.], [3, 13, 1, 1, 3.]], threshold: -2.1309209987521172e-003, right_val: 0.5361018776893616, left_val: 0.2106848061084747 }, { features: [[8, 14, 5, 3, -1.], [8, 15, 5, 1, 3.]], threshold: -0.0132084200158715, right_val: 0.4552468061447144, left_val: 0.7593790888786316 }, { features: [[5, 4, 10, 12, -1.], [5, 4, 5, 6, 2.], [10, 10, 5, 6, 2.]], threshold: -0.0659966766834259, right_val: 0.5344039797782898, left_val: 0.1252475976943970 }, { features: [[9, 6, 9, 12, -1.], [9, 10, 9, 4, 3.]], threshold: 7.9142656177282333e-003, right_val: 0.5601043105125427, left_val: 0.3315384089946747 }, { features: [[2, 2, 12, 14, -1.], [2, 2, 6, 7, 2.], [8, 9, 6, 7, 2.]], threshold: 0.0208942797034979, right_val: 0.2768838107585907, left_val: 0.5506049990653992 }], threshold: 15.3241395950317380 }, { simpleClassifiers: [{ features: [[4, 7, 12, 2, -1.], [8, 7, 4, 2, 3.]], threshold: 1.1961159761995077e-003, right_val: 0.6156241297721863, left_val: 0.1762690991163254 }, { features: [[7, 4, 6, 4, -1.], [7, 6, 6, 2, 2.]], threshold: -1.8679830245673656e-003, right_val: 0.1832399964332581, left_val: 0.6118106842041016 }, { features: [[4, 5, 11, 8, -1.], [4, 9, 11, 4, 2.]], threshold: -1.9579799845814705e-004, right_val: 0.5723816156387329, left_val: 0.0990442633628845 }, { features: [[3, 10, 16, 4, -1.], [3, 12, 16, 2, 2.]], threshold: -8.0255657667294145e-004, right_val: 0.2377282977104187, left_val: 0.5579879879951477 }, { features: [[0, 0, 16, 2, -1.], [0, 1, 16, 1, 2.]], threshold: -2.4510810617357492e-003, right_val: 0.5858935117721558, left_val: 0.2231457978487015 }, { features: [[7, 5, 6, 2, -1.], [9, 5, 2, 2, 3.]], threshold: 5.0361850298941135e-004, right_val: 0.5794103741645813, left_val: 0.2653993964195252 }, { features: [[3, 2, 6, 10, -1.], [3, 2, 3, 5, 2.], [6, 7, 3, 5, 2.]], threshold: 4.0293349884450436e-003, right_val: 0.2484865039587021, left_val: 0.5803827047348023 }, { features: [[10, 5, 8, 15, -1.], [10, 10, 8, 5, 3.]], threshold: -0.0144517095759511, right_val: 0.5484204888343811, left_val: 0.1830351948738098 }, { features: [[3, 14, 8, 6, -1.], [3, 14, 4, 3, 2.], [7, 17, 4, 3, 2.]], threshold: 2.0380979403853416e-003, right_val: 0.6051092743873596, left_val: 0.3363558948040009 }, { features: [[14, 2, 2, 2, -1.], [14, 3, 2, 1, 2.]], threshold: -1.6155190533027053e-003, right_val: 0.5441246032714844, left_val: 0.2286642044782639 }, { features: [[1, 10, 7, 6, -1.], [1, 13, 7, 3, 2.]], threshold: 3.3458340913057327e-003, right_val: 0.2392338067293167, left_val: 0.5625913143157959 }, { features: [[15, 4, 4, 3, -1.], [15, 4, 2, 3, 2.]], threshold: 1.6379579901695251e-003, right_val: 0.5964621901512146, left_val: 0.3906993865966797 }, { features: [[2, 9, 14, 6, -1.], [2, 9, 7, 3, 2.], [9, 12, 7, 3, 2.]], threshold: 0.0302512105554342, right_val: 0.1575746983289719, left_val: 0.5248482227325440 }, { features: [[5, 7, 10, 4, -1.], [5, 9, 10, 2, 2.]], threshold: 0.0372519902884960, right_val: 0.6748418807983398, left_val: 0.4194310903549194 }, { features: [[6, 9, 8, 8, -1.], [6, 9, 4, 4, 2.], [10, 13, 4, 4, 2.]], threshold: -0.0251097902655602, right_val: 0.5473451018333435, left_val: 0.1882549971342087 }, { features: [[14, 1, 3, 2, -1.], [14, 2, 3, 1, 2.]], threshold: -5.3099058568477631e-003, right_val: 0.5227110981941223, left_val: 0.1339973062276840 }, { features: [[1, 4, 4, 2, -1.], [3, 4, 2, 2, 2.]], threshold: 1.2086479691788554e-003, right_val: 0.6109635829925537, left_val: 0.3762088119983673 }, { features: [[11, 10, 2, 8, -1.], [11, 14, 2, 4, 2.]], threshold: -0.0219076797366142, right_val: 0.5404006838798523, left_val: 0.2663142979145050 }, { features: [[0, 0, 5, 3, -1.], [0, 1, 5, 1, 3.]], threshold: 5.4116579703986645e-003, right_val: 0.2232273072004318, left_val: 0.5363578796386719 }, { features: [[2, 5, 18, 8, -1.], [11, 5, 9, 4, 2.], [2, 9, 9, 4, 2.]], threshold: 0.0699463263154030, right_val: 0.2453698068857193, left_val: 0.5358232855796814 }, { features: [[6, 6, 1, 6, -1.], [6, 9, 1, 3, 2.]], threshold: 3.4520021290518343e-004, right_val: 0.5376930236816406, left_val: 0.2409671992063522 }, { features: [[19, 1, 1, 3, -1.], [19, 2, 1, 1, 3.]], threshold: 1.2627709656953812e-003, right_val: 0.3155693113803864, left_val: 0.5425856709480286 }, { features: [[7, 6, 6, 6, -1.], [9, 6, 2, 6, 3.]], threshold: 0.0227195098996162, right_val: 0.6597865223884583, left_val: 0.4158405959606171 }, { features: [[19, 1, 1, 3, -1.], [19, 2, 1, 1, 3.]], threshold: -1.8111000536009669e-003, right_val: 0.5505244731903076, left_val: 0.2811253070831299 }, { features: [[3, 13, 2, 3, -1.], [3, 14, 2, 1, 3.]], threshold: 3.3469670452177525e-003, right_val: 0.1891465038061142, left_val: 0.5260028243064880 }, { features: [[8, 4, 8, 12, -1.], [12, 4, 4, 6, 2.], [8, 10, 4, 6, 2.]], threshold: 4.0791751234792173e-004, right_val: 0.3344210088253021, left_val: 0.5673509240150452 }, { features: [[5, 2, 6, 3, -1.], [7, 2, 2, 3, 3.]], threshold: 0.0127347996458411, right_val: 0.2395612001419067, left_val: 0.5343592166900635 }, { features: [[6, 1, 9, 10, -1.], [6, 6, 9, 5, 2.]], threshold: -7.3119727894663811e-003, right_val: 0.4022207856178284, left_val: 0.6010890007019043 }, { features: [[0, 4, 6, 12, -1.], [2, 4, 2, 12, 3.]], threshold: -0.0569487512111664, right_val: 0.4543190896511078, left_val: 0.8199151158332825 }, { features: [[15, 13, 2, 3, -1.], [15, 14, 2, 1, 3.]], threshold: -5.0116591155529022e-003, right_val: 0.5357710719108582, left_val: 0.2200281023979187 }, { features: [[7, 14, 5, 3, -1.], [7, 15, 5, 1, 3.]], threshold: 6.0334368608891964e-003, right_val: 0.7181751132011414, left_val: 0.4413081109523773 }, { features: [[15, 13, 3, 3, -1.], [15, 14, 3, 1, 3.]], threshold: 3.9437441155314445e-003, right_val: 0.2791733145713806, left_val: 0.5478860735893250 }, { features: [[6, 14, 8, 3, -1.], [6, 15, 8, 1, 3.]], threshold: -3.6591119132936001e-003, right_val: 0.3989723920822144, left_val: 0.6357867717742920 }, { features: [[15, 13, 3, 3, -1.], [15, 14, 3, 1, 3.]], threshold: -3.8456181064248085e-003, right_val: 0.5300664901733398, left_val: 0.3493686020374298 }, { features: [[2, 13, 3, 3, -1.], [2, 14, 3, 1, 3.]], threshold: -7.1926261298358440e-003, right_val: 0.5229672789573669, left_val: 0.1119614988565445 }, { features: [[4, 7, 12, 12, -1.], [10, 7, 6, 6, 2.], [4, 13, 6, 6, 2.]], threshold: -0.0527989417314529, right_val: 0.5453451275825501, left_val: 0.2387102991342545 }, { features: [[9, 7, 2, 6, -1.], [10, 7, 1, 6, 2.]], threshold: -7.9537667334079742e-003, right_val: 0.4439376890659332, left_val: 0.7586917877197266 }, { features: [[8, 9, 5, 2, -1.], [8, 10, 5, 1, 2.]], threshold: -2.7344180271029472e-003, right_val: 0.5489321947097778, left_val: 0.2565476894378662 }, { features: [[8, 6, 3, 4, -1.], [9, 6, 1, 4, 3.]], threshold: -1.8507939530536532e-003, right_val: 0.4252474904060364, left_val: 0.6734347939491272 }, { features: [[9, 6, 2, 8, -1.], [9, 10, 2, 4, 2.]], threshold: 0.0159189198166132, right_val: 0.2292661964893341, left_val: 0.5488352775573731 }, { features: [[7, 7, 3, 6, -1.], [8, 7, 1, 6, 3.]], threshold: -1.2687679845839739e-003, right_val: 0.4022389948368073, left_val: 0.6104331016540527 }, { features: [[11, 3, 3, 3, -1.], [12, 3, 1, 3, 3.]], threshold: 6.2883910723030567e-003, right_val: 0.1536193042993546, left_val: 0.5310853123664856 }, { features: [[5, 4, 6, 1, -1.], [7, 4, 2, 1, 3.]], threshold: -6.2259892001748085e-003, right_val: 0.5241606235504150, left_val: 0.1729111969470978 }, { features: [[5, 6, 10, 3, -1.], [5, 7, 10, 1, 3.]], threshold: -0.0121325999498367, right_val: 0.4325182139873505, left_val: 0.6597759723663330 }], threshold: 21.0106391906738280 }, { simpleClassifiers: [{ features: [[7, 3, 6, 9, -1.], [7, 6, 6, 3, 3.]], threshold: -3.9184908382594585e-003, right_val: 0.1469330936670303, left_val: 0.6103435158729553 }, { features: [[6, 7, 9, 1, -1.], [9, 7, 3, 1, 3.]], threshold: 1.5971299726516008e-003, right_val: 0.5896466970443726, left_val: 0.2632363140583038 }, { features: [[2, 8, 16, 8, -1.], [2, 12, 16, 4, 2.]], threshold: 0.0177801102399826, right_val: 0.1760361939668655, left_val: 0.5872874259948731 }, { features: [[14, 6, 2, 6, -1.], [14, 9, 2, 3, 2.]], threshold: 6.5334769897162914e-004, right_val: 0.5596066117286682, left_val: 0.1567801982164383 }, { features: [[1, 5, 6, 15, -1.], [1, 10, 6, 5, 3.]], threshold: -2.8353091329336166e-004, right_val: 0.5732036232948303, left_val: 0.1913153976202011 }, { features: [[10, 0, 6, 9, -1.], [10, 3, 6, 3, 3.]], threshold: 1.6104689566418529e-003, right_val: 0.5623080730438232, left_val: 0.2914913892745972 }, { features: [[6, 6, 7, 14, -1.], [6, 13, 7, 7, 2.]], threshold: -0.0977506190538406, right_val: 0.5648233294487000, left_val: 0.1943476945161820 }, { features: [[13, 7, 3, 6, -1.], [13, 9, 3, 2, 3.]], threshold: 5.5182358482852578e-004, right_val: 0.5504639744758606, left_val: 0.3134616911411285 }, { features: [[1, 8, 15, 4, -1.], [6, 8, 5, 4, 3.]], threshold: -0.0128582203760743, right_val: 0.5760142803192139, left_val: 0.2536481916904450 }, { features: [[11, 2, 3, 10, -1.], [11, 7, 3, 5, 2.]], threshold: 4.1530239395797253e-003, right_val: 0.3659774065017700, left_val: 0.5767722129821777 }, { features: [[3, 7, 4, 6, -1.], [3, 9, 4, 2, 3.]], threshold: 1.7092459602281451e-003, right_val: 0.5918939113616943, left_val: 0.2843191027641296 }, { features: [[13, 3, 6, 10, -1.], [15, 3, 2, 10, 3.]], threshold: 7.5217359699308872e-003, right_val: 0.6183109283447266, left_val: 0.4052427113056183 }, { features: [[5, 7, 8, 10, -1.], [5, 7, 4, 5, 2.], [9, 12, 4, 5, 2.]], threshold: 2.2479810286313295e-003, right_val: 0.3135401010513306, left_val: 0.5783755183219910 }, { features: [[4, 4, 12, 12, -1.], [10, 4, 6, 6, 2.], [4, 10, 6, 6, 2.]], threshold: 0.0520062111318111, right_val: 0.1916636973619461, left_val: 0.5541312098503113 }, { features: [[1, 4, 6, 9, -1.], [3, 4, 2, 9, 3.]], threshold: 0.0120855299755931, right_val: 0.6644591093063355, left_val: 0.4032655954360962 }, { features: [[11, 3, 2, 5, -1.], [11, 3, 1, 5, 2.]], threshold: 1.4687820112158079e-005, right_val: 0.5709382891654968, left_val: 0.3535977900028229 }, { features: [[7, 3, 2, 5, -1.], [8, 3, 1, 5, 2.]], threshold: 7.1395188570022583e-006, right_val: 0.5610269904136658, left_val: 0.3037444949150085 }, { features: [[10, 14, 2, 3, -1.], [10, 15, 2, 1, 3.]], threshold: -4.6001640148460865e-003, right_val: 0.4580326080322266, left_val: 0.7181087136268616 }, { features: [[5, 12, 6, 2, -1.], [8, 12, 3, 2, 2.]], threshold: 2.0058949012309313e-003, right_val: 0.2953684031963348, left_val: 0.5621951818466187 }, { features: [[9, 14, 2, 3, -1.], [9, 15, 2, 1, 3.]], threshold: 4.5050270855426788e-003, right_val: 0.7619017958641052, left_val: 0.4615387916564941 }, { features: [[4, 11, 12, 6, -1.], [4, 14, 12, 3, 2.]], threshold: 0.0117468303069472, right_val: 0.1772529035806656, left_val: 0.5343837141990662 }, { features: [[11, 11, 5, 9, -1.], [11, 14, 5, 3, 3.]], threshold: -0.0583163388073444, right_val: 0.5340772271156311, left_val: 0.1686245948076248 }, { features: [[6, 15, 3, 2, -1.], [6, 16, 3, 1, 2.]], threshold: 2.3629379575140774e-004, right_val: 0.6026803851127625, left_val: 0.3792056143283844 }, { features: [[11, 0, 3, 5, -1.], [12, 0, 1, 5, 3.]], threshold: -7.8156180679798126e-003, right_val: 0.5324323773384094, left_val: 0.1512867063283920 }, { features: [[5, 5, 6, 7, -1.], [8, 5, 3, 7, 2.]], threshold: -0.0108761601150036, right_val: 0.5319945216178894, left_val: 0.2081822007894516 }, { features: [[13, 0, 1, 9, -1.], [13, 3, 1, 3, 3.]], threshold: -2.7745519764721394e-003, right_val: 0.5210328102111816, left_val: 0.4098246991634369 }, { features: [[3, 2, 4, 8, -1.], [3, 2, 2, 4, 2.], [5, 6, 2, 4, 2.]], threshold: -7.8276381827890873e-004, right_val: 0.3478842079639435, left_val: 0.5693274140357971 }, { features: [[13, 12, 4, 6, -1.], [13, 14, 4, 2, 3.]], threshold: 0.0138704096898437, right_val: 0.2257698029279709, left_val: 0.5326750874519348 }, { features: [[3, 12, 4, 6, -1.], [3, 14, 4, 2, 3.]], threshold: -0.0236749108880758, right_val: 0.5200707912445068, left_val: 0.1551305055618286 }, { features: [[13, 11, 3, 4, -1.], [13, 13, 3, 2, 2.]], threshold: -1.4879409718560055e-005, right_val: 0.3820176124572754, left_val: 0.5500566959381104 }, { features: [[4, 4, 4, 3, -1.], [4, 5, 4, 1, 3.]], threshold: 3.6190641112625599e-003, right_val: 0.6639748215675354, left_val: 0.4238683879375458 }, { features: [[7, 5, 11, 8, -1.], [7, 9, 11, 4, 2.]], threshold: -0.0198171101510525, right_val: 0.5382357835769653, left_val: 0.2150038033723831 }, { features: [[7, 8, 3, 4, -1.], [8, 8, 1, 4, 3.]], threshold: -3.8154039066284895e-003, right_val: 0.4215297102928162, left_val: 0.6675711274147034 }, { features: [[9, 1, 6, 1, -1.], [11, 1, 2, 1, 3.]], threshold: -4.9775829538702965e-003, right_val: 0.5386328101158142, left_val: 0.2267289012670517 }, { features: [[5, 5, 3, 3, -1.], [5, 6, 3, 1, 3.]], threshold: 2.2441020701080561e-003, right_val: 0.6855735778808594, left_val: 0.4308691024780273 }, { features: [[0, 9, 20, 6, -1.], [10, 9, 10, 3, 2.], [0, 12, 10, 3, 2.]], threshold: 0.0122824599966407, right_val: 0.3467479050159454, left_val: 0.5836614966392517 }, { features: [[8, 6, 3, 5, -1.], [9, 6, 1, 5, 3.]], threshold: -2.8548699337989092e-003, right_val: 0.4311453998088837, left_val: 0.7016944885253906 }, { features: [[11, 0, 1, 3, -1.], [11, 1, 1, 1, 3.]], threshold: -3.7875669077038765e-003, right_val: 0.5224946141242981, left_val: 0.2895345091819763 }, { features: [[4, 2, 4, 2, -1.], [4, 3, 4, 1, 2.]], threshold: -1.2201230274513364e-003, right_val: 0.5481644868850708, left_val: 0.2975570857524872 }, { features: [[12, 6, 4, 3, -1.], [12, 7, 4, 1, 3.]], threshold: 0.0101605998352170, right_val: 0.8182697892189026, left_val: 0.4888817965984345 }, { features: [[5, 0, 6, 4, -1.], [7, 0, 2, 4, 3.]], threshold: -0.0161745697259903, right_val: 0.5239992737770081, left_val: 0.1481492966413498 }, { features: [[9, 7, 3, 8, -1.], [10, 7, 1, 8, 3.]], threshold: 0.0192924607545137, right_val: 0.7378190755844116, left_val: 0.4786309897899628 }, { features: [[9, 7, 2, 2, -1.], [10, 7, 1, 2, 2.]], threshold: -3.2479539513587952e-003, right_val: 0.4470643997192383, left_val: 0.7374222874641419 }, { features: [[6, 7, 14, 4, -1.], [13, 7, 7, 2, 2.], [6, 9, 7, 2, 2.]], threshold: -9.3803480267524719e-003, right_val: 0.5537996292114258, left_val: 0.3489154875278473 }, { features: [[0, 5, 3, 6, -1.], [0, 7, 3, 2, 3.]], threshold: -0.0126061299815774, right_val: 0.5315443277359009, left_val: 0.2379686981439591 }, { features: [[13, 11, 3, 4, -1.], [13, 13, 3, 2, 2.]], threshold: -0.0256219301372766, right_val: 0.5138769745826721, left_val: 0.1964688003063202 }, { features: [[4, 11, 3, 4, -1.], [4, 13, 3, 2, 2.]], threshold: -7.5741496402770281e-005, right_val: 0.3365853130817413, left_val: 0.5590522885322571 }, { features: [[5, 9, 12, 8, -1.], [11, 9, 6, 4, 2.], [5, 13, 6, 4, 2.]], threshold: -0.0892108827829361, right_val: 0.5162634849548340, left_val: 0.0634046569466591 }, { features: [[9, 12, 1, 3, -1.], [9, 13, 1, 1, 3.]], threshold: -2.7670480776578188e-003, right_val: 0.4490706026554108, left_val: 0.7323467731475830 }, { features: [[10, 15, 2, 4, -1.], [10, 17, 2, 2, 2.]], threshold: 2.7152578695677221e-004, right_val: 0.5985518097877502, left_val: 0.4114834964275360 }], threshold: 23.9187908172607420 }, { simpleClassifiers: [{ features: [[7, 7, 6, 1, -1.], [9, 7, 2, 1, 3.]], threshold: 1.4786219689995050e-003, right_val: 0.6643316745758057, left_val: 0.2663545012474060 }, { features: [[12, 3, 6, 6, -1.], [15, 3, 3, 3, 2.], [12, 6, 3, 3, 2.]], threshold: -1.8741659587249160e-003, right_val: 0.2518512904644013, left_val: 0.6143848896026611 }, { features: [[0, 4, 10, 6, -1.], [0, 6, 10, 2, 3.]], threshold: -1.7151009524241090e-003, right_val: 0.2397463023662567, left_val: 0.5766341090202332 }, { features: [[8, 3, 8, 14, -1.], [12, 3, 4, 7, 2.], [8, 10, 4, 7, 2.]], threshold: -1.8939269939437509e-003, right_val: 0.2529144883155823, left_val: 0.5682045817375183 }, { features: [[4, 4, 7, 15, -1.], [4, 9, 7, 5, 3.]], threshold: -5.3006052039563656e-003, right_val: 0.5556079745292664, left_val: 0.1640675961971283 }, { features: [[12, 2, 6, 8, -1.], [15, 2, 3, 4, 2.], [12, 6, 3, 4, 2.]], threshold: -0.0466625317931175, right_val: 0.4762830138206482, left_val: 0.6123154163360596 }, { features: [[2, 2, 6, 8, -1.], [2, 2, 3, 4, 2.], [5, 6, 3, 4, 2.]], threshold: -7.9431332414969802e-004, right_val: 0.2839404046535492, left_val: 0.5707858800888062 }, { features: [[2, 13, 18, 7, -1.], [8, 13, 6, 7, 3.]], threshold: 0.0148916700854898, right_val: 0.6006367206573486, left_val: 0.4089672863483429 }, { features: [[4, 3, 8, 14, -1.], [4, 3, 4, 7, 2.], [8, 10, 4, 7, 2.]], threshold: -1.2046529445797205e-003, right_val: 0.2705289125442505, left_val: 0.5712450742721558 }, { features: [[18, 1, 2, 6, -1.], [18, 3, 2, 2, 3.]], threshold: 6.0619381256401539e-003, right_val: 0.3262225985527039, left_val: 0.5262504220008850 }, { features: [[9, 11, 2, 3, -1.], [9, 12, 2, 1, 3.]], threshold: -2.5286648888140917e-003, right_val: 0.4199256896972656, left_val: 0.6853830814361572 }, { features: [[18, 1, 2, 6, -1.], [18, 3, 2, 2, 3.]], threshold: -5.9010218828916550e-003, right_val: 0.5434812903404236, left_val: 0.3266282081604004 }, { features: [[0, 1, 2, 6, -1.], [0, 3, 2, 2, 3.]], threshold: 5.6702760048210621e-003, right_val: 0.2319003939628601, left_val: 0.5468410849571228 }, { features: [[1, 5, 18, 6, -1.], [1, 7, 18, 2, 3.]], threshold: -3.0304100364446640e-003, right_val: 0.2708238065242767, left_val: 0.5570667982101440 }, { features: [[0, 2, 6, 7, -1.], [3, 2, 3, 7, 2.]], threshold: 2.9803649522364140e-003, right_val: 0.5890625715255737, left_val: 0.3700568974018097 }, { features: [[7, 3, 6, 14, -1.], [7, 10, 6, 7, 2.]], threshold: -0.0758405104279518, right_val: 0.5419948101043701, left_val: 0.2140070050954819 }, { features: [[3, 7, 13, 10, -1.], [3, 12, 13, 5, 2.]], threshold: 0.0192625392228365, right_val: 0.2726590037345886, left_val: 0.5526772141456604 }, { features: [[11, 15, 2, 2, -1.], [11, 16, 2, 1, 2.]], threshold: 1.8888259364757687e-004, right_val: 0.6017209887504578, left_val: 0.3958011865615845 }, { features: [[2, 11, 16, 4, -1.], [2, 11, 8, 2, 2.], [10, 13, 8, 2, 2.]], threshold: 0.0293695498257875, right_val: 0.1435758024454117, left_val: 0.5241373777389526 }, { features: [[13, 7, 6, 4, -1.], [16, 7, 3, 2, 2.], [13, 9, 3, 2, 2.]], threshold: 1.0417619487270713e-003, right_val: 0.5929983258247376, left_val: 0.3385409116744995 }, { features: [[6, 10, 3, 9, -1.], [6, 13, 3, 3, 3.]], threshold: 2.6125640142709017e-003, right_val: 0.3021597862243652, left_val: 0.5485377907752991 }, { features: [[14, 6, 1, 6, -1.], [14, 9, 1, 3, 2.]], threshold: 9.6977467183023691e-004, right_val: 0.5532032847404480, left_val: 0.3375276029109955 }, { features: [[5, 10, 4, 1, -1.], [7, 10, 2, 1, 2.]], threshold: 5.9512659208849072e-004, right_val: 0.3359399139881134, left_val: 0.5631743073463440 }, { features: [[3, 8, 15, 5, -1.], [8, 8, 5, 5, 3.]], threshold: -0.1015655994415283, right_val: 0.5230425000190735, left_val: 0.0637350380420685 }, { features: [[1, 6, 5, 4, -1.], [1, 8, 5, 2, 2.]], threshold: 0.0361566990613937, right_val: 0.1029528975486755, left_val: 0.5136963129043579 }, { features: [[3, 1, 17, 6, -1.], [3, 3, 17, 2, 3.]], threshold: 3.4624140243977308e-003, right_val: 0.5558289289474487, left_val: 0.3879320025444031 }, { features: [[6, 7, 8, 2, -1.], [10, 7, 4, 2, 2.]], threshold: 0.0195549800992012, right_val: 0.1875859946012497, left_val: 0.5250086784362793 }, { features: [[9, 7, 3, 2, -1.], [10, 7, 1, 2, 3.]], threshold: -2.3121440317481756e-003, right_val: 0.4679641127586365, left_val: 0.6672028899192810 }, { features: [[8, 7, 3, 2, -1.], [9, 7, 1, 2, 3.]], threshold: -1.8605289515107870e-003, right_val: 0.4334670901298523, left_val: 0.7163379192352295 }, { features: [[8, 9, 4, 2, -1.], [8, 10, 4, 1, 2.]], threshold: -9.4026362057775259e-004, right_val: 0.5650203227996826, left_val: 0.3021360933780670 }, { features: [[8, 8, 4, 3, -1.], [8, 9, 4, 1, 3.]], threshold: -5.2418331615626812e-003, right_val: 0.5250256061553955, left_val: 0.1820009052753449 }, { features: [[9, 5, 6, 4, -1.], [9, 5, 3, 4, 2.]], threshold: 1.1729019752237946e-004, right_val: 0.5445973277091980, left_val: 0.3389188051223755 }, { features: [[8, 13, 4, 3, -1.], [8, 14, 4, 1, 3.]], threshold: 1.1878840159624815e-003, right_val: 0.6253563165664673, left_val: 0.4085349142551422 }, { features: [[4, 7, 12, 6, -1.], [10, 7, 6, 3, 2.], [4, 10, 6, 3, 2.]], threshold: -0.0108813596889377, right_val: 0.5700082778930664, left_val: 0.3378399014472961 }, { features: [[8, 14, 4, 3, -1.], [8, 15, 4, 1, 3.]], threshold: 1.7354859737679362e-003, right_val: 0.6523038744926453, left_val: 0.4204635918140411 }, { features: [[9, 7, 3, 3, -1.], [9, 8, 3, 1, 3.]], threshold: -6.5119052305817604e-003, right_val: 0.5428143739700317, left_val: 0.2595216035842896 }, { features: [[7, 4, 3, 8, -1.], [8, 4, 1, 8, 3.]], threshold: -1.2136430013924837e-003, right_val: 0.3977893888950348, left_val: 0.6165143847465515 }, { features: [[10, 0, 3, 6, -1.], [11, 0, 1, 6, 3.]], threshold: -0.0103542404249310, right_val: 0.5219504833221436, left_val: 0.1628028005361557 }, { features: [[6, 3, 4, 8, -1.], [8, 3, 2, 8, 2.]], threshold: 5.5858830455690622e-004, right_val: 0.5503574013710022, left_val: 0.3199650943279266 }, { features: [[14, 3, 6, 13, -1.], [14, 3, 3, 13, 2.]], threshold: 0.0152996499091387, right_val: 0.6122388243675232, left_val: 0.4103994071483612 }, { features: [[8, 13, 3, 6, -1.], [8, 16, 3, 3, 2.]], threshold: -0.0215882100164890, right_val: 0.5197384953498840, left_val: 0.1034912988543510 }, { features: [[14, 3, 6, 13, -1.], [14, 3, 3, 13, 2.]], threshold: -0.1283462941646576, right_val: 0.4893102943897247, left_val: 0.8493865132331848 }, { features: [[0, 7, 10, 4, -1.], [0, 7, 5, 2, 2.], [5, 9, 5, 2, 2.]], threshold: -2.2927189711481333e-003, right_val: 0.5471575260162354, left_val: 0.3130157887935638 }, { features: [[14, 3, 6, 13, -1.], [14, 3, 3, 13, 2.]], threshold: 0.0799151062965393, right_val: 0.6073989272117615, left_val: 0.4856320917606354 }, { features: [[0, 3, 6, 13, -1.], [3, 3, 3, 13, 2.]], threshold: -0.0794410929083824, right_val: 0.4624533057212830, left_val: 0.8394674062728882 }, { features: [[9, 1, 4, 1, -1.], [9, 1, 2, 1, 2.]], threshold: -5.2800010889768600e-003, right_val: 0.5306698083877564, left_val: 0.1881695985794067 }, { features: [[8, 0, 2, 1, -1.], [9, 0, 1, 1, 2.]], threshold: 1.0463109938427806e-003, right_val: 0.2583065927028656, left_val: 0.5271229147911072 }, { features: [[10, 16, 4, 4, -1.], [12, 16, 2, 2, 2.], [10, 18, 2, 2, 2.]], threshold: 2.6317298761568964e-004, right_val: 0.5735440850257874, left_val: 0.4235304892063141 }, { features: [[9, 6, 2, 3, -1.], [10, 6, 1, 3, 2.]], threshold: -3.6173160187900066e-003, right_val: 0.4495444893836975, left_val: 0.6934396028518677 }, { features: [[4, 5, 12, 2, -1.], [8, 5, 4, 2, 3.]], threshold: 0.0114218797534704, right_val: 0.4138193130493164, left_val: 0.5900921225547791 }, { features: [[8, 7, 3, 5, -1.], [9, 7, 1, 5, 3.]], threshold: -1.9963278900831938e-003, right_val: 0.4327239990234375, left_val: 0.6466382741928101 }], threshold: 24.5278797149658200 }, { simpleClassifiers: [{ features: [[6, 4, 8, 6, -1.], [6, 6, 8, 2, 3.]], threshold: -9.9691245704889297e-003, right_val: 0.2482212036848068, left_val: 0.6142324209213257 }, { features: [[9, 5, 2, 12, -1.], [9, 11, 2, 6, 2.]], threshold: 7.3073059320449829e-004, right_val: 0.2321965992450714, left_val: 0.5704951882362366 }, { features: [[4, 6, 6, 8, -1.], [4, 10, 6, 4, 2.]], threshold: 6.4045301405712962e-004, right_val: 0.5814933180809021, left_val: 0.2112251967191696 }, { features: [[12, 2, 8, 5, -1.], [12, 2, 4, 5, 2.]], threshold: 4.5424019917845726e-003, right_val: 0.5866311788558960, left_val: 0.2950482070446014 }, { features: [[0, 8, 18, 3, -1.], [0, 9, 18, 1, 3.]], threshold: 9.2477443104144186e-005, right_val: 0.5791326761245728, left_val: 0.2990990877151489 }, { features: [[8, 12, 4, 8, -1.], [8, 16, 4, 4, 2.]], threshold: -8.6603146046400070e-003, right_val: 0.5635542273521423, left_val: 0.2813029885292053 }, { features: [[0, 2, 8, 5, -1.], [4, 2, 4, 5, 2.]], threshold: 8.0515816807746887e-003, right_val: 0.6054757237434387, left_val: 0.3535369038581848 }, { features: [[13, 11, 3, 4, -1.], [13, 13, 3, 2, 2.]], threshold: 4.3835240649059415e-004, right_val: 0.2731510996818543, left_val: 0.5596532225608826 }, { features: [[5, 11, 6, 1, -1.], [7, 11, 2, 1, 3.]], threshold: -9.8168973636347800e-005, right_val: 0.3638561069965363, left_val: 0.5978031754493713 }, { features: [[11, 3, 3, 1, -1.], [12, 3, 1, 1, 3.]], threshold: -1.1298790341243148e-003, right_val: 0.5432729125022888, left_val: 0.2755252122879028 }, { features: [[7, 13, 5, 3, -1.], [7, 14, 5, 1, 3.]], threshold: 6.4356150105595589e-003, right_val: 0.7069833278656006, left_val: 0.4305641949176788 }, { features: [[11, 11, 7, 6, -1.], [11, 14, 7, 3, 2.]], threshold: -0.0568293295800686, right_val: 0.5294997096061707, left_val: 0.2495242953300476 }, { features: [[2, 11, 7, 6, -1.], [2, 14, 7, 3, 2.]], threshold: 4.0668169967830181e-003, right_val: 0.2497723996639252, left_val: 0.5478553175926209 }, { features: [[12, 14, 2, 6, -1.], [12, 16, 2, 2, 3.]], threshold: 4.8164798499783501e-005, right_val: 0.5706356167793274, left_val: 0.3938601016998291 }, { features: [[8, 14, 3, 3, -1.], [8, 15, 3, 1, 3.]], threshold: 6.1795017682015896e-003, right_val: 0.7394766807556152, left_val: 0.4407606124877930 }, { features: [[11, 0, 3, 5, -1.], [12, 0, 1, 5, 3.]], threshold: 6.4985752105712891e-003, right_val: 0.2479152977466583, left_val: 0.5445243120193481 }, { features: [[6, 1, 4, 9, -1.], [8, 1, 2, 9, 2.]], threshold: -1.0211090557277203e-003, right_val: 0.5338971018791199, left_val: 0.2544766962528229 }, { features: [[10, 3, 6, 1, -1.], [12, 3, 2, 1, 3.]], threshold: -5.4247528314590454e-003, right_val: 0.5324069261550903, left_val: 0.2718858122825623 }, { features: [[8, 8, 3, 4, -1.], [8, 10, 3, 2, 2.]], threshold: -1.0559899965301156e-003, right_val: 0.5534508824348450, left_val: 0.3178288042545319 }, { features: [[8, 12, 4, 2, -1.], [8, 13, 4, 1, 2.]], threshold: 6.6465808777138591e-004, right_val: 0.6558194160461426, left_val: 0.4284219145774841 }, { features: [[5, 18, 4, 2, -1.], [5, 19, 4, 1, 2.]], threshold: -2.7524109464138746e-004, right_val: 0.3810262978076935, left_val: 0.5902860760688782 }, { features: [[2, 1, 18, 6, -1.], [2, 3, 18, 2, 3.]], threshold: 4.2293202131986618e-003, right_val: 0.5709385871887207, left_val: 0.3816489875316620 }, { features: [[6, 0, 3, 2, -1.], [7, 0, 1, 2, 3.]], threshold: -3.2868210691958666e-003, right_val: 0.5259544253349304, left_val: 0.1747743934392929 }, { features: [[13, 8, 6, 2, -1.], [16, 8, 3, 1, 2.], [13, 9, 3, 1, 2.]], threshold: 1.5611879643984139e-004, right_val: 0.5725612044334412, left_val: 0.3601722121238709 }, { features: [[6, 10, 3, 6, -1.], [6, 13, 3, 3, 2.]], threshold: -7.3621381488919724e-006, right_val: 0.3044497072696686, left_val: 0.5401858091354370 }, { features: [[0, 13, 20, 4, -1.], [10, 13, 10, 2, 2.], [0, 15, 10, 2, 2.]], threshold: -0.0147672500461340, right_val: 0.5573434829711914, left_val: 0.3220770061016083 }, { features: [[7, 7, 6, 5, -1.], [9, 7, 2, 5, 3.]], threshold: 0.0244895908981562, right_val: 0.6518812775611877, left_val: 0.4301528036594391 }, { features: [[11, 0, 2, 2, -1.], [11, 1, 2, 1, 2.]], threshold: -3.7652091123163700e-004, right_val: 0.5598236918449402, left_val: 0.3564583063125610 }, { features: [[1, 8, 6, 2, -1.], [1, 8, 3, 1, 2.], [4, 9, 3, 1, 2.]], threshold: 7.3657688517414499e-006, right_val: 0.5561897754669190, left_val: 0.3490782976150513 }, { features: [[0, 2, 20, 2, -1.], [10, 2, 10, 1, 2.], [0, 3, 10, 1, 2.]], threshold: -0.0150999398902059, right_val: 0.5335299968719482, left_val: 0.1776272058486939 }, { features: [[7, 14, 5, 3, -1.], [7, 15, 5, 1, 3.]], threshold: -3.8316650316119194e-003, right_val: 0.4221394062042236, left_val: 0.6149687767028809 }, { features: [[7, 13, 6, 6, -1.], [10, 13, 3, 3, 2.], [7, 16, 3, 3, 2.]], threshold: 0.0169254001230001, right_val: 0.2166585028171539, left_val: 0.5413014888763428 }, { features: [[9, 12, 2, 3, -1.], [9, 13, 2, 1, 3.]], threshold: -3.0477850232273340e-003, right_val: 0.4354617893695831, left_val: 0.6449490785598755 }, { features: [[16, 11, 1, 6, -1.], [16, 13, 1, 2, 3.]], threshold: 3.2140589319169521e-003, right_val: 0.3523217141628265, left_val: 0.5400155186653137 }, { features: [[3, 11, 1, 6, -1.], [3, 13, 1, 2, 3.]], threshold: -4.0023201145231724e-003, right_val: 0.5338417291641235, left_val: 0.2774524092674255 }, { features: [[4, 4, 14, 12, -1.], [11, 4, 7, 6, 2.], [4, 10, 7, 6, 2.]], threshold: 7.4182129465043545e-003, right_val: 0.3702817857265472, left_val: 0.5676739215850830 }, { features: [[5, 4, 3, 3, -1.], [5, 5, 3, 1, 3.]], threshold: -8.8764587417244911e-003, right_val: 0.4583688974380493, left_val: 0.7749221920967102 }, { features: [[12, 3, 3, 3, -1.], [13, 3, 1, 3, 3.]], threshold: 2.7311739977449179e-003, right_val: 0.3996661007404327, left_val: 0.5338721871376038 }, { features: [[6, 6, 8, 3, -1.], [6, 7, 8, 1, 3.]], threshold: -2.5082379579544067e-003, right_val: 0.3777498900890350, left_val: 0.5611963272094727 }, { features: [[12, 3, 3, 3, -1.], [13, 3, 1, 3, 3.]], threshold: -8.0541074275970459e-003, right_val: 0.5179182887077332, left_val: 0.2915228903293610 }, { features: [[3, 1, 4, 10, -1.], [3, 1, 2, 5, 2.], [5, 6, 2, 5, 2.]], threshold: -9.7938813269138336e-004, right_val: 0.3700192868709564, left_val: 0.5536432862281799 }, { features: [[5, 7, 10, 2, -1.], [5, 7, 5, 2, 2.]], threshold: -5.8745909482240677e-003, right_val: 0.5679376125335693, left_val: 0.3754391074180603 }, { features: [[8, 7, 3, 3, -1.], [9, 7, 1, 3, 3.]], threshold: -4.4936719350516796e-003, right_val: 0.4480949938297272, left_val: 0.7019699215888977 }, { features: [[15, 12, 2, 3, -1.], [15, 13, 2, 1, 3.]], threshold: -5.4389229044318199e-003, right_val: 0.5313386917114258, left_val: 0.2310364991426468 }, { features: [[7, 8, 3, 4, -1.], [8, 8, 1, 4, 3.]], threshold: -7.5094640487805009e-004, right_val: 0.4129343032836914, left_val: 0.5864868760108948 }, { features: [[13, 4, 1, 12, -1.], [13, 10, 1, 6, 2.]], threshold: 1.4528800420521293e-005, right_val: 0.5619621276855469, left_val: 0.3732407093048096 }, { features: [[4, 5, 12, 12, -1.], [4, 5, 6, 6, 2.], [10, 11, 6, 6, 2.]], threshold: 0.0407580696046352, right_val: 0.2720521986484528, left_val: 0.5312091112136841 }, { features: [[7, 14, 7, 3, -1.], [7, 15, 7, 1, 3.]], threshold: 6.6505931317806244e-003, right_val: 0.6693493723869324, left_val: 0.4710015952587128 }, { features: [[3, 12, 2, 3, -1.], [3, 13, 2, 1, 3.]], threshold: 4.5759351924061775e-003, right_val: 0.1637275964021683, left_val: 0.5167819261550903 }, { features: [[3, 2, 14, 2, -1.], [10, 2, 7, 1, 2.], [3, 3, 7, 1, 2.]], threshold: 6.5269311890006065e-003, right_val: 0.2938531935214996, left_val: 0.5397608876228333 }, { features: [[0, 1, 3, 10, -1.], [1, 1, 1, 10, 3.]], threshold: -0.0136603796854615, right_val: 0.4532200098037720, left_val: 0.7086488008499146 }, { features: [[9, 0, 6, 5, -1.], [11, 0, 2, 5, 3.]], threshold: 0.0273588690906763, right_val: 0.3589231967926025, left_val: 0.5206481218338013 }, { features: [[5, 7, 6, 2, -1.], [8, 7, 3, 2, 2.]], threshold: 6.2197551596909761e-004, right_val: 0.5441123247146606, left_val: 0.3507075905799866 }, { features: [[7, 1, 6, 10, -1.], [7, 6, 6, 5, 2.]], threshold: -3.3077080734074116e-003, right_val: 0.4024891853332520, left_val: 0.5859522819519043 }, { features: [[1, 1, 18, 3, -1.], [7, 1, 6, 3, 3.]], threshold: -0.0106311095878482, right_val: 0.4422602951526642, left_val: 0.6743267178535461 }, { features: [[16, 3, 3, 6, -1.], [16, 5, 3, 2, 3.]], threshold: 0.0194416493177414, right_val: 0.1797904968261719, left_val: 0.5282716155052185 }], threshold: 27.1533508300781250 }, { simpleClassifiers: [{ features: [[6, 3, 7, 6, -1.], [6, 6, 7, 3, 2.]], threshold: -5.5052167735993862e-003, right_val: 0.2626559138298035, left_val: 0.5914731025695801 }, { features: [[4, 7, 12, 2, -1.], [8, 7, 4, 2, 3.]], threshold: 1.9562279339879751e-003, right_val: 0.5741627216339111, left_val: 0.2312581986188889 }, { features: [[0, 4, 17, 10, -1.], [0, 9, 17, 5, 2.]], threshold: -8.8924784213304520e-003, right_val: 0.5626654028892517, left_val: 0.1656530052423477 }, { features: [[3, 4, 15, 16, -1.], [3, 12, 15, 8, 2.]], threshold: 0.0836383774876595, right_val: 0.1957294940948486, left_val: 0.5423449873924255 }, { features: [[7, 15, 6, 4, -1.], [7, 17, 6, 2, 2.]], threshold: 1.2282270472496748e-003, right_val: 0.5992503762245178, left_val: 0.3417904078960419 }, { features: [[15, 2, 4, 9, -1.], [15, 2, 2, 9, 2.]], threshold: 5.7629169896245003e-003, right_val: 0.6079903841018677, left_val: 0.3719581961631775 }, { features: [[2, 3, 3, 2, -1.], [2, 4, 3, 1, 2.]], threshold: -1.6417410224676132e-003, right_val: 0.5576915740966797, left_val: 0.2577486038208008 }, { features: [[13, 6, 7, 9, -1.], [13, 9, 7, 3, 3.]], threshold: 3.4113149158656597e-003, right_val: 0.5514171719551086, left_val: 0.2950749099254608 }, { features: [[8, 11, 4, 3, -1.], [8, 12, 4, 1, 3.]], threshold: -0.0110693201422691, right_val: 0.4477078914642334, left_val: 0.7569358944892883 }, { features: [[0, 2, 20, 6, -1.], [10, 2, 10, 3, 2.], [0, 5, 10, 3, 2.]], threshold: 0.0348659716546535, right_val: 0.2669621109962463, left_val: 0.5583708882331848 }, { features: [[3, 2, 6, 10, -1.], [3, 2, 3, 5, 2.], [6, 7, 3, 5, 2.]], threshold: 6.5701099811121821e-004, right_val: 0.2988890111446381, left_val: 0.5627313256263733 }, { features: [[13, 10, 3, 4, -1.], [13, 12, 3, 2, 2.]], threshold: -0.0243391301482916, right_val: 0.5108863115310669, left_val: 0.2771185040473938 }, { features: [[4, 10, 3, 4, -1.], [4, 12, 3, 2, 2.]], threshold: 5.9435202274471521e-004, right_val: 0.3120341897010803, left_val: 0.5580651760101318 }, { features: [[7, 5, 6, 3, -1.], [9, 5, 2, 3, 3.]], threshold: 2.2971509024500847e-003, right_val: 0.5679075717926025, left_val: 0.3330250084400177 }, { features: [[7, 6, 6, 8, -1.], [7, 10, 6, 4, 2.]], threshold: -3.7801829166710377e-003, right_val: 0.5344808101654053, left_val: 0.2990534901618958 }, { features: [[0, 11, 20, 6, -1.], [0, 14, 20, 3, 2.]], threshold: -0.1342066973447800, right_val: 0.5392568111419678, left_val: 0.1463858932256699 }, { features: [[4, 13, 4, 6, -1.], [4, 13, 2, 3, 2.], [6, 16, 2, 3, 2.]], threshold: 7.5224548345431685e-004, right_val: 0.5692734718322754, left_val: 0.3746953904628754 }, { features: [[6, 0, 8, 12, -1.], [10, 0, 4, 6, 2.], [6, 6, 4, 6, 2.]], threshold: -0.0405455417931080, right_val: 0.5484297871589661, left_val: 0.2754747867584229 }, { features: [[2, 0, 15, 2, -1.], [2, 1, 15, 1, 2.]], threshold: 1.2572970008477569e-003, right_val: 0.5756075978279114, left_val: 0.3744584023952484 }, { features: [[9, 12, 2, 3, -1.], [9, 13, 2, 1, 3.]], threshold: -7.4249948374927044e-003, right_val: 0.4728231132030487, left_val: 0.7513859272003174 }, { features: [[3, 12, 1, 2, -1.], [3, 13, 1, 1, 2.]], threshold: 5.0908129196614027e-004, right_val: 0.2932321131229401, left_val: 0.5404896736145020 }, { features: [[9, 11, 2, 3, -1.], [9, 12, 2, 1, 3.]], threshold: -1.2808450264856219e-003, right_val: 0.4273349046707153, left_val: 0.6169779896736145 }, { features: [[7, 3, 3, 1, -1.], [8, 3, 1, 1, 3.]], threshold: -1.8348860321566463e-003, right_val: 0.5206472277641296, left_val: 0.2048496007919312 }, { features: [[17, 7, 3, 6, -1.], [17, 9, 3, 2, 3.]], threshold: 0.0274848695844412, right_val: 0.1675522029399872, left_val: 0.5252984762191773 }, { features: [[7, 2, 3, 2, -1.], [8, 2, 1, 2, 3.]], threshold: 2.2372419480234385e-003, right_val: 0.2777658104896545, left_val: 0.5267782807350159 }, { features: [[11, 4, 5, 3, -1.], [11, 5, 5, 1, 3.]], threshold: -8.8635291904211044e-003, right_val: 0.4812048971652985, left_val: 0.6954557895660400 }, { features: [[4, 4, 5, 3, -1.], [4, 5, 5, 1, 3.]], threshold: 4.1753971017897129e-003, right_val: 0.6349195837974548, left_val: 0.4291887879371643 }, { features: [[19, 3, 1, 2, -1.], [19, 4, 1, 1, 2.]], threshold: -1.7098189564421773e-003, right_val: 0.5361248850822449, left_val: 0.2930536866188049 }, { features: [[5, 5, 4, 3, -1.], [5, 6, 4, 1, 3.]], threshold: 6.5328548662364483e-003, right_val: 0.7409694194793701, left_val: 0.4495325088500977 }, { features: [[17, 7, 3, 6, -1.], [17, 9, 3, 2, 3.]], threshold: -9.5372907817363739e-003, right_val: 0.5416501760482788, left_val: 0.3149119913578033 }, { features: [[0, 7, 3, 6, -1.], [0, 9, 3, 2, 3.]], threshold: 0.0253109894692898, right_val: 0.1311707943677902, left_val: 0.5121892094612122 }, { features: [[14, 2, 6, 9, -1.], [14, 5, 6, 3, 3.]], threshold: 0.0364609695971012, right_val: 0.2591339945793152, left_val: 0.5175911784172058 }, { features: [[0, 4, 5, 6, -1.], [0, 6, 5, 2, 3.]], threshold: 0.0208543296903372, right_val: 0.1582316011190414, left_val: 0.5137140154838562 }, { features: [[10, 5, 6, 2, -1.], [12, 5, 2, 2, 3.]], threshold: -8.7207747856155038e-004, right_val: 0.4398978948593140, left_val: 0.5574309825897217 }, { features: [[4, 5, 6, 2, -1.], [6, 5, 2, 2, 3.]], threshold: -1.5227000403683633e-005, right_val: 0.3708069920539856, left_val: 0.5548940896987915 }, { features: [[8, 1, 4, 6, -1.], [8, 3, 4, 2, 3.]], threshold: -8.4316509310156107e-004, right_val: 0.5554211139678955, left_val: 0.3387419879436493 }, { features: [[0, 2, 3, 6, -1.], [0, 4, 3, 2, 3.]], threshold: 3.6037859972566366e-003, right_val: 0.3411171138286591, left_val: 0.5358061790466309 }, { features: [[6, 6, 8, 3, -1.], [6, 7, 8, 1, 3.]], threshold: -6.8057891912758350e-003, right_val: 0.4345862865447998, left_val: 0.6125202775001526 }, { features: [[0, 1, 5, 9, -1.], [0, 4, 5, 3, 3.]], threshold: -0.0470216609537601, right_val: 0.5193738937377930, left_val: 0.2358165979385376 }, { features: [[16, 0, 4, 15, -1.], [16, 0, 2, 15, 2.]], threshold: -0.0369541086256504, right_val: 0.4760943949222565, left_val: 0.7323111295700073 }, { features: [[1, 10, 3, 2, -1.], [1, 11, 3, 1, 2.]], threshold: 1.0439479956403375e-003, right_val: 0.3411330878734589, left_val: 0.5419455170631409 }, { features: [[14, 4, 1, 10, -1.], [14, 9, 1, 5, 2.]], threshold: -2.1050689974799752e-004, right_val: 0.5554947257041931, left_val: 0.2821694016456604 }, { features: [[0, 1, 4, 12, -1.], [2, 1, 2, 12, 2.]], threshold: -0.0808315873146057, right_val: 0.4697434902191162, left_val: 0.9129930138587952 }, { features: [[11, 11, 4, 2, -1.], [11, 11, 2, 2, 2.]], threshold: -3.6579059087671340e-004, right_val: 0.3978292942047119, left_val: 0.6022670269012451 }, { features: [[5, 11, 4, 2, -1.], [7, 11, 2, 2, 2.]], threshold: -1.2545920617412776e-004, right_val: 0.3845539987087250, left_val: 0.5613213181495667 }, { features: [[3, 8, 15, 5, -1.], [8, 8, 5, 5, 3.]], threshold: -0.0687864869832993, right_val: 0.5300496816635132, left_val: 0.2261611968278885 }, { features: [[0, 0, 6, 10, -1.], [3, 0, 3, 10, 2.]], threshold: 0.0124157899990678, right_val: 0.5828812122344971, left_val: 0.4075691998004913 }, { features: [[11, 4, 3, 2, -1.], [12, 4, 1, 2, 3.]], threshold: -4.7174817882478237e-003, right_val: 0.5267757773399353, left_val: 0.2827253937721252 }, { features: [[8, 12, 3, 8, -1.], [8, 16, 3, 4, 2.]], threshold: 0.0381368584930897, right_val: 0.1023615971207619, left_val: 0.5074741244316101 }, { features: [[8, 14, 5, 3, -1.], [8, 15, 5, 1, 3.]], threshold: -2.8168049175292253e-003, right_val: 0.4359692931175232, left_val: 0.6169006824493408 }, { features: [[7, 14, 4, 3, -1.], [7, 15, 4, 1, 3.]], threshold: 8.1303603947162628e-003, right_val: 0.7606095075607300, left_val: 0.4524433016777039 }, { features: [[11, 4, 3, 2, -1.], [12, 4, 1, 2, 3.]], threshold: 6.0056019574403763e-003, right_val: 0.1859712004661560, left_val: 0.5240408778190613 }, { features: [[3, 15, 14, 4, -1.], [3, 15, 7, 2, 2.], [10, 17, 7, 2, 2.]], threshold: 0.0191393196582794, right_val: 0.2332071959972382, left_val: 0.5209379196166992 }, { features: [[2, 2, 16, 4, -1.], [10, 2, 8, 2, 2.], [2, 4, 8, 2, 2.]], threshold: 0.0164457596838474, right_val: 0.3264234960079193, left_val: 0.5450702905654907 }, { features: [[0, 8, 6, 12, -1.], [3, 8, 3, 12, 2.]], threshold: -0.0373568907380104, right_val: 0.4533241987228394, left_val: 0.6999046802520752 }, { features: [[5, 7, 10, 2, -1.], [5, 7, 5, 2, 2.]], threshold: -0.0197279006242752, right_val: 0.5412809848785400, left_val: 0.2653664946556091 }, { features: [[9, 7, 2, 5, -1.], [10, 7, 1, 5, 2.]], threshold: 6.6972579807043076e-003, right_val: 0.7138652205467224, left_val: 0.4480566084384918 }, { features: [[13, 7, 6, 4, -1.], [16, 7, 3, 2, 2.], [13, 9, 3, 2, 2.]], threshold: 7.4457528535276651e-004, right_val: 0.5471320152282715, left_val: 0.4231350123882294 }, { features: [[0, 13, 8, 2, -1.], [0, 14, 8, 1, 2.]], threshold: 1.1790640419349074e-003, right_val: 0.3130455017089844, left_val: 0.5341702103614807 }, { features: [[13, 7, 6, 4, -1.], [16, 7, 3, 2, 2.], [13, 9, 3, 2, 2.]], threshold: 0.0349806100130081, right_val: 0.3430530130863190, left_val: 0.5118659734725952 }, { features: [[1, 7, 6, 4, -1.], [1, 7, 3, 2, 2.], [4, 9, 3, 2, 2.]], threshold: 5.6859792675822973e-004, right_val: 0.5468639731407166, left_val: 0.3532187044620514 }, { features: [[12, 6, 1, 12, -1.], [12, 12, 1, 6, 2.]], threshold: -0.0113406497985125, right_val: 0.5348700881004334, left_val: 0.2842353880405426 }, { features: [[9, 5, 2, 6, -1.], [10, 5, 1, 6, 2.]], threshold: -6.6228108480572701e-003, right_val: 0.4492664933204651, left_val: 0.6883640289306641 }, { features: [[14, 12, 2, 3, -1.], [14, 13, 2, 1, 3.]], threshold: -8.0160330981016159e-003, right_val: 0.5224308967590332, left_val: 0.1709893941879273 }, { features: [[4, 12, 2, 3, -1.], [4, 13, 2, 1, 3.]], threshold: 1.4206819469109178e-003, right_val: 0.2993383109569550, left_val: 0.5290846228599548 }, { features: [[8, 12, 4, 3, -1.], [8, 13, 4, 1, 3.]], threshold: -2.7801711112260818e-003, right_val: 0.4460499882698059, left_val: 0.6498854160308838 }, { features: [[5, 2, 2, 4, -1.], [5, 2, 1, 2, 2.], [6, 4, 1, 2, 2.]], threshold: -1.4747589593753219e-003, right_val: 0.5388113260269165, left_val: 0.3260438144207001 }, { features: [[5, 5, 11, 3, -1.], [5, 6, 11, 1, 3.]], threshold: -0.0238303393125534, right_val: 0.4801219999790192, left_val: 0.7528941035270691 }, { features: [[7, 6, 4, 12, -1.], [7, 12, 4, 6, 2.]], threshold: 6.9369790144264698e-003, right_val: 0.3261427879333496, left_val: 0.5335165858268738 }, { features: [[12, 13, 8, 5, -1.], [12, 13, 4, 5, 2.]], threshold: 8.2806255668401718e-003, right_val: 0.5737829804420471, left_val: 0.4580394029617310 }, { features: [[7, 6, 1, 12, -1.], [7, 12, 1, 6, 2.]], threshold: -0.0104395002126694, right_val: 0.5233827829360962, left_val: 0.2592320144176483 }], threshold: 34.5541114807128910 }, { simpleClassifiers: [{ features: [[1, 2, 6, 3, -1.], [4, 2, 3, 3, 2.]], threshold: 7.2006587870419025e-003, right_val: 0.6849808096885681, left_val: 0.3258886039257050 }, { features: [[9, 5, 6, 10, -1.], [12, 5, 3, 5, 2.], [9, 10, 3, 5, 2.]], threshold: -2.8593589086085558e-003, right_val: 0.2537829875946045, left_val: 0.5838881134986877 }, { features: [[5, 5, 8, 12, -1.], [5, 5, 4, 6, 2.], [9, 11, 4, 6, 2.]], threshold: 6.8580528022721410e-004, right_val: 0.2812424004077911, left_val: 0.5708081722259522 }, { features: [[0, 7, 20, 6, -1.], [0, 9, 20, 2, 3.]], threshold: 7.9580191522836685e-003, right_val: 0.5544260740280151, left_val: 0.2501051127910614 }, { features: [[4, 2, 2, 2, -1.], [4, 3, 2, 1, 2.]], threshold: -1.2124150525778532e-003, right_val: 0.5433350205421448, left_val: 0.2385368049144745 }, { features: [[4, 18, 12, 2, -1.], [8, 18, 4, 2, 3.]], threshold: 7.9426132142543793e-003, right_val: 0.6220757961273193, left_val: 0.3955070972442627 }, { features: [[7, 4, 4, 16, -1.], [7, 12, 4, 8, 2.]], threshold: 2.4630590341985226e-003, right_val: 0.2992357909679413, left_val: 0.5639708042144775 }, { features: [[7, 6, 7, 8, -1.], [7, 10, 7, 4, 2.]], threshold: -6.0396599583327770e-003, right_val: 0.5411676764488220, left_val: 0.2186512947082520 }, { features: [[6, 3, 3, 1, -1.], [7, 3, 1, 1, 3.]], threshold: -1.2988339876756072e-003, right_val: 0.5364584922790527, left_val: 0.2350706011056900 }, { features: [[11, 15, 2, 4, -1.], [11, 17, 2, 2, 2.]], threshold: 2.2299369447864592e-004, right_val: 0.5729606151580811, left_val: 0.3804112970829010 }, { features: [[3, 5, 4, 8, -1.], [3, 9, 4, 4, 2.]], threshold: 1.4654280385002494e-003, right_val: 0.5258268713951111, left_val: 0.2510167956352234 }, { features: [[7, 1, 6, 12, -1.], [7, 7, 6, 6, 2.]], threshold: -8.1210042117163539e-004, right_val: 0.3851158916950226, left_val: 0.5992823839187622 }, { features: [[4, 6, 6, 2, -1.], [6, 6, 2, 2, 3.]], threshold: -1.3836020370945334e-003, right_val: 0.3636586964130402, left_val: 0.5681396126747131 }, { features: [[16, 4, 4, 6, -1.], [16, 6, 4, 2, 3.]], threshold: -0.0279364492744207, right_val: 0.5377560257911682, left_val: 0.1491317003965378 }, { features: [[3, 3, 5, 2, -1.], [3, 4, 5, 1, 2.]], threshold: -4.6919551095925272e-004, right_val: 0.5572484731674194, left_val: 0.3692429959774017 }, { features: [[9, 11, 2, 3, -1.], [9, 12, 2, 1, 3.]], threshold: -4.9829659983515739e-003, right_val: 0.4532504081726074, left_val: 0.6758509278297424 }, { features: [[2, 16, 4, 2, -1.], [2, 17, 4, 1, 2.]], threshold: 1.8815309740602970e-003, right_val: 0.2932539880275726, left_val: 0.5368022918701172 }, { features: [[7, 13, 6, 6, -1.], [10, 13, 3, 3, 2.], [7, 16, 3, 3, 2.]], threshold: -0.0190675500780344, right_val: 0.5330067276954651, left_val: 0.1649377048015595 }, { features: [[7, 0, 3, 4, -1.], [8, 0, 1, 4, 3.]], threshold: -4.6906559728085995e-003, right_val: 0.5119361877441406, left_val: 0.1963925957679749 }, { features: [[8, 15, 4, 3, -1.], [8, 16, 4, 1, 3.]], threshold: 5.9777139686048031e-003, right_val: 0.7008398175239563, left_val: 0.4671171903610230 }, { features: [[0, 4, 4, 6, -1.], [0, 6, 4, 2, 3.]], threshold: -0.0333031304180622, right_val: 0.5104162096977234, left_val: 0.1155416965484619 }, { features: [[5, 6, 12, 3, -1.], [9, 6, 4, 3, 3.]], threshold: 0.0907441079616547, right_val: 0.1306173056364059, left_val: 0.5149660110473633 }, { features: [[7, 6, 6, 14, -1.], [9, 6, 2, 14, 3.]], threshold: 9.3555898638442159e-004, right_val: 0.5439859032630920, left_val: 0.3605481088161469 }, { features: [[9, 7, 3, 3, -1.], [10, 7, 1, 3, 3.]], threshold: 0.0149016501381993, right_val: 0.7687569856643677, left_val: 0.4886212050914764 }, { features: [[6, 12, 2, 4, -1.], [6, 14, 2, 2, 2.]], threshold: 6.1594118596985936e-004, right_val: 0.3240939080715179, left_val: 0.5356813073158264 }, { features: [[10, 12, 7, 6, -1.], [10, 14, 7, 2, 3.]], threshold: -0.0506709888577461, right_val: 0.5230404138565064, left_val: 0.1848621964454651 }, { features: [[1, 0, 15, 2, -1.], [1, 1, 15, 1, 2.]], threshold: 6.8665749859064817e-004, right_val: 0.5517945885658264, left_val: 0.3840579986572266 }, { features: [[14, 0, 6, 6, -1.], [14, 0, 3, 6, 2.]], threshold: 8.3712432533502579e-003, right_val: 0.6131753921508789, left_val: 0.4288564026355743 }, { features: [[5, 3, 3, 1, -1.], [6, 3, 1, 1, 3.]], threshold: -1.2953069526702166e-003, right_val: 0.5280737876892090, left_val: 0.2913674116134644 }, { features: [[14, 0, 6, 6, -1.], [14, 0, 3, 6, 2.]], threshold: -0.0419416800141335, right_val: 0.4856030941009522, left_val: 0.7554799914360046 }, { features: [[0, 3, 20, 10, -1.], [0, 8, 20, 5, 2.]], threshold: -0.0235293805599213, right_val: 0.5256081223487854, left_val: 0.2838279902935028 }, { features: [[14, 0, 6, 6, -1.], [14, 0, 3, 6, 2.]], threshold: 0.0408574491739273, right_val: 0.6277297139167786, left_val: 0.4870935082435608 }, { features: [[0, 0, 6, 6, -1.], [3, 0, 3, 6, 2.]], threshold: -0.0254068691283464, right_val: 0.4575029015541077, left_val: 0.7099707722663879 }, { features: [[19, 15, 1, 2, -1.], [19, 16, 1, 1, 2.]], threshold: -4.1415440500713885e-004, right_val: 0.5469412207603455, left_val: 0.4030886888504028 }, { features: [[0, 2, 4, 8, -1.], [2, 2, 2, 8, 2.]], threshold: 0.0218241196125746, right_val: 0.6768701076507568, left_val: 0.4502024054527283 }, { features: [[2, 1, 18, 4, -1.], [11, 1, 9, 2, 2.], [2, 3, 9, 2, 2.]], threshold: 0.0141140399500728, right_val: 0.3791700005531311, left_val: 0.5442860722541809 }, { features: [[8, 12, 1, 2, -1.], [8, 13, 1, 1, 2.]], threshold: 6.7214590671937913e-005, right_val: 0.5873476266860962, left_val: 0.4200463891029358 }, { features: [[5, 2, 10, 6, -1.], [10, 2, 5, 3, 2.], [5, 5, 5, 3, 2.]], threshold: -7.9417638480663300e-003, right_val: 0.5585265755653381, left_val: 0.3792561888694763 }, { features: [[9, 7, 2, 4, -1.], [10, 7, 1, 4, 2.]], threshold: -7.2144409641623497e-003, right_val: 0.4603548943996429, left_val: 0.7253103852272034 }, { features: [[9, 7, 3, 3, -1.], [10, 7, 1, 3, 3.]], threshold: 2.5817339774221182e-003, right_val: 0.5900238752365112, left_val: 0.4693301916122437 }, { features: [[4, 5, 12, 8, -1.], [8, 5, 4, 8, 3.]], threshold: 0.1340931951999664, right_val: 0.1808844953775406, left_val: 0.5149213075637817 }, { features: [[15, 15, 4, 3, -1.], [15, 16, 4, 1, 3.]], threshold: 2.2962710354477167e-003, right_val: 0.3717867136001587, left_val: 0.5399743914604187 }, { features: [[8, 18, 3, 1, -1.], [9, 18, 1, 1, 3.]], threshold: -2.1575849968940020e-003, right_val: 0.5148863792419434, left_val: 0.2408495992422104 }, { features: [[9, 13, 4, 3, -1.], [9, 14, 4, 1, 3.]], threshold: -4.9196188338100910e-003, right_val: 0.4738740026950836, left_val: 0.6573588252067566 }, { features: [[7, 13, 4, 3, -1.], [7, 14, 4, 1, 3.]], threshold: 1.6267469618469477e-003, right_val: 0.6303114295005798, left_val: 0.4192821979522705 }, { features: [[19, 15, 1, 2, -1.], [19, 16, 1, 1, 2.]], threshold: 3.3413388882763684e-004, right_val: 0.3702101111412048, left_val: 0.5540298223495483 }, { features: [[0, 15, 8, 4, -1.], [0, 17, 8, 2, 2.]], threshold: -0.0266980808228254, right_val: 0.5101410746574402, left_val: 0.1710917949676514 }, { features: [[9, 3, 6, 4, -1.], [11, 3, 2, 4, 3.]], threshold: -0.0305618792772293, right_val: 0.5168793797492981, left_val: 0.1904218047857285 }, { features: [[8, 14, 4, 3, -1.], [8, 15, 4, 1, 3.]], threshold: 2.8511548880487680e-003, right_val: 0.6313853859901428, left_val: 0.4447506964206696 }, { features: [[3, 14, 14, 6, -1.], [3, 16, 14, 2, 3.]], threshold: -0.0362114794552326, right_val: 0.5377349257469177, left_val: 0.2490727007389069 }, { features: [[6, 3, 6, 6, -1.], [6, 6, 6, 3, 2.]], threshold: -2.4115189444273710e-003, right_val: 0.3664236962795258, left_val: 0.5381243228912354 }, { features: [[5, 11, 10, 6, -1.], [5, 14, 10, 3, 2.]], threshold: -7.7253201743587852e-004, right_val: 0.3541550040245056, left_val: 0.5530232191085815 }, { features: [[3, 10, 3, 4, -1.], [4, 10, 1, 4, 3.]], threshold: 2.9481729143299162e-004, right_val: 0.5667243003845215, left_val: 0.4132699072360992 }, { features: [[13, 9, 2, 2, -1.], [13, 9, 1, 2, 2.]], threshold: -6.2334560789167881e-003, right_val: 0.5198668837547302, left_val: 0.0987872332334518 }, { features: [[5, 3, 6, 4, -1.], [7, 3, 2, 4, 3.]], threshold: -0.0262747295200825, right_val: 0.5028107166290283, left_val: 0.0911274924874306 }, { features: [[9, 7, 3, 3, -1.], [10, 7, 1, 3, 3.]], threshold: 5.3212260827422142e-003, right_val: 0.6222720742225647, left_val: 0.4726648926734924 }, { features: [[2, 12, 2, 3, -1.], [2, 13, 2, 1, 3.]], threshold: -4.1129058226943016e-003, right_val: 0.5137804746627808, left_val: 0.2157457023859024 }, { features: [[9, 8, 3, 12, -1.], [9, 12, 3, 4, 3.]], threshold: 3.2457809429615736e-003, right_val: 0.3721776902675629, left_val: 0.5410770773887634 }, { features: [[3, 14, 4, 6, -1.], [3, 14, 2, 3, 2.], [5, 17, 2, 3, 2.]], threshold: -0.0163597092032433, right_val: 0.4685291945934296, left_val: 0.7787874937057495 }, { features: [[16, 15, 2, 2, -1.], [16, 16, 2, 1, 2.]], threshold: 3.2166109303943813e-004, right_val: 0.4240373969078064, left_val: 0.5478987097740173 }, { features: [[2, 15, 2, 2, -1.], [2, 16, 2, 1, 2.]], threshold: 6.4452440710738301e-004, right_val: 0.3501324951648712, left_val: 0.5330560803413391 }, { features: [[8, 12, 4, 3, -1.], [8, 13, 4, 1, 3.]], threshold: -7.8909732401371002e-003, right_val: 0.4726569056510925, left_val: 0.6923521161079407 }, { features: [[0, 7, 20, 1, -1.], [10, 7, 10, 1, 2.]], threshold: 0.0483362115919590, right_val: 0.0757492035627365, left_val: 0.5055900216102600 }, { features: [[7, 6, 8, 3, -1.], [7, 6, 4, 3, 2.]], threshold: -7.5178127735853195e-004, right_val: 0.5538573861122131, left_val: 0.3783741891384125 }, { features: [[5, 7, 8, 2, -1.], [9, 7, 4, 2, 2.]], threshold: -2.4953910615295172e-003, right_val: 0.5359612107276917, left_val: 0.3081651031970978 }, { features: [[9, 7, 3, 5, -1.], [10, 7, 1, 5, 3.]], threshold: -2.2385010961443186e-003, right_val: 0.4649342894554138, left_val: 0.6633958816528320 }, { features: [[8, 7, 3, 5, -1.], [9, 7, 1, 5, 3.]], threshold: -1.7988430336117744e-003, right_val: 0.4347187876701355, left_val: 0.6596844792366028 }, { features: [[11, 1, 3, 5, -1.], [12, 1, 1, 5, 3.]], threshold: 8.7860915809869766e-003, right_val: 0.2315579950809479, left_val: 0.5231832861900330 }, { features: [[6, 2, 3, 6, -1.], [7, 2, 1, 6, 3.]], threshold: 3.6715380847454071e-003, right_val: 0.2977376878261566, left_val: 0.5204250216484070 }, { features: [[14, 14, 6, 5, -1.], [14, 14, 3, 5, 2.]], threshold: -0.0353364497423172, right_val: 0.4861505031585693, left_val: 0.7238878011703491 }, { features: [[9, 8, 2, 2, -1.], [9, 9, 2, 1, 2.]], threshold: -6.9189240457490087e-004, right_val: 0.5229824781417847, left_val: 0.3105022013187408 }, { features: [[10, 7, 1, 3, -1.], [10, 8, 1, 1, 3.]], threshold: -3.3946109469980001e-003, right_val: 0.5210173726081848, left_val: 0.3138968050479889 }, { features: [[6, 6, 2, 2, -1.], [6, 6, 1, 1, 2.], [7, 7, 1, 1, 2.]], threshold: 9.8569283727556467e-004, right_val: 0.6585097908973694, left_val: 0.4536580145359039 }, { features: [[2, 11, 18, 4, -1.], [11, 11, 9, 2, 2.], [2, 13, 9, 2, 2.]], threshold: -0.0501631014049053, right_val: 0.5198916792869568, left_val: 0.1804454028606415 }, { features: [[6, 6, 2, 2, -1.], [6, 6, 1, 1, 2.], [7, 7, 1, 1, 2.]], threshold: -2.2367259953171015e-003, right_val: 0.4651359021663666, left_val: 0.7255702018737793 }, { features: [[0, 15, 20, 2, -1.], [0, 16, 20, 1, 2.]], threshold: 7.4326287722215056e-004, right_val: 0.5898545980453491, left_val: 0.4412921071052551 }, { features: [[4, 14, 2, 3, -1.], [4, 15, 2, 1, 3.]], threshold: -9.3485182151198387e-004, right_val: 0.5366017818450928, left_val: 0.3500052988529205 }, { features: [[8, 14, 4, 3, -1.], [8, 15, 4, 1, 3.]], threshold: 0.0174979399889708, right_val: 0.8315284848213196, left_val: 0.4912194907665253 }, { features: [[8, 7, 2, 3, -1.], [8, 8, 2, 1, 3.]], threshold: -1.5200000489130616e-003, right_val: 0.5370560288429260, left_val: 0.3570275902748108 }, { features: [[9, 10, 2, 3, -1.], [9, 11, 2, 1, 3.]], threshold: 7.8003940870985389e-004, right_val: 0.5967335104942322, left_val: 0.4353772103786469 }], threshold: 39.1072883605957030 }, { simpleClassifiers: [{ features: [[5, 4, 10, 4, -1.], [5, 6, 10, 2, 2.]], threshold: -9.9945552647113800e-003, right_val: 0.3054533004760742, left_val: 0.6162583231925964 }, { features: [[9, 7, 6, 4, -1.], [12, 7, 3, 2, 2.], [9, 9, 3, 2, 2.]], threshold: -1.1085229925811291e-003, right_val: 0.3155578076839447, left_val: 0.5818294882774353 }, { features: [[4, 7, 3, 6, -1.], [4, 9, 3, 2, 3.]], threshold: 1.0364380432292819e-003, right_val: 0.5692911744117737, left_val: 0.2552052140235901 }, { features: [[11, 15, 4, 4, -1.], [13, 15, 2, 2, 2.], [11, 17, 2, 2, 2.]], threshold: 6.8211311008781195e-004, right_val: 0.5934931039810181, left_val: 0.3685089945793152 }, { features: [[7, 8, 4, 2, -1.], [7, 9, 4, 1, 2.]], threshold: -6.8057340104132891e-004, right_val: 0.5474792122840881, left_val: 0.2332392036914825 }, { features: [[13, 1, 4, 3, -1.], [13, 1, 2, 3, 2.]], threshold: 2.6068789884448051e-004, right_val: 0.5667545795440674, left_val: 0.3257457017898560 }, { features: [[5, 15, 4, 4, -1.], [5, 15, 2, 2, 2.], [7, 17, 2, 2, 2.]], threshold: 5.1607372006401420e-004, right_val: 0.5845472812652588, left_val: 0.3744716942310333 }, { features: [[9, 5, 4, 7, -1.], [9, 5, 2, 7, 2.]], threshold: 8.5007521556690335e-004, right_val: 0.5522807240486145, left_val: 0.3420371115207672 }, { features: [[5, 6, 8, 3, -1.], [9, 6, 4, 3, 2.]], threshold: -1.8607829697430134e-003, right_val: 0.5375424027442932, left_val: 0.2804419994354248 }, { features: [[9, 9, 2, 2, -1.], [9, 10, 2, 1, 2.]], threshold: -1.5033970121294260e-003, right_val: 0.5498952269554138, left_val: 0.2579050958156586 }, { features: [[7, 15, 5, 3, -1.], [7, 16, 5, 1, 3.]], threshold: 2.3478909861296415e-003, right_val: 0.6313710808753967, left_val: 0.4175156056880951 }, { features: [[11, 10, 4, 3, -1.], [11, 10, 2, 3, 2.]], threshold: -2.8880240279249847e-004, right_val: 0.4052666127681732, left_val: 0.5865169763565064 }, { features: [[6, 9, 8, 10, -1.], [6, 14, 8, 5, 2.]], threshold: 8.9405477046966553e-003, right_val: 0.2318654060363770, left_val: 0.5211141109466553 }, { features: [[10, 11, 6, 2, -1.], [10, 11, 3, 2, 2.]], threshold: -0.0193277392536402, right_val: 0.5241525769233704, left_val: 0.2753432989120483 }, { features: [[4, 11, 6, 2, -1.], [7, 11, 3, 2, 2.]], threshold: -2.0202060113660991e-004, right_val: 0.3677195906639099, left_val: 0.5722978711128235 }, { features: [[11, 3, 8, 1, -1.], [11, 3, 4, 1, 2.]], threshold: 2.1179069299250841e-003, right_val: 0.5542430877685547, left_val: 0.4466108083724976 }, { features: [[6, 3, 3, 2, -1.], [7, 3, 1, 2, 3.]], threshold: -1.7743760254234076e-003, right_val: 0.5300959944725037, left_val: 0.2813253104686737 }, { features: [[14, 5, 6, 5, -1.], [14, 5, 3, 5, 2.]], threshold: 4.2234458960592747e-003, right_val: 0.5795428156852722, left_val: 0.4399709999561310 }, { features: [[7, 5, 2, 12, -1.], [7, 11, 2, 6, 2.]], threshold: -0.0143752200528979, right_val: 0.5292059183120728, left_val: 0.2981117963790894 }, { features: [[8, 11, 4, 3, -1.], [8, 12, 4, 1, 3.]], threshold: -0.0153491804376245, right_val: 0.4748171865940094, left_val: 0.7705215215682983 }, { features: [[4, 1, 2, 3, -1.], [5, 1, 1, 3, 2.]], threshold: 1.5152279956964776e-005, right_val: 0.5576897263526917, left_val: 0.3718844056129456 }, { features: [[18, 3, 2, 6, -1.], [18, 5, 2, 2, 3.]], threshold: -9.1293919831514359e-003, right_val: 0.5286766886711121, left_val: 0.3615196049213409 }, { features: [[0, 3, 2, 6, -1.], [0, 5, 2, 2, 3.]], threshold: 2.2512159775942564e-003, right_val: 0.3486298024654388, left_val: 0.5364704728126526 }, { features: [[9, 12, 2, 3, -1.], [9, 13, 2, 1, 3.]], threshold: -4.9696918576955795e-003, right_val: 0.4676836133003235, left_val: 0.6927651762962341 }, { features: [[7, 13, 4, 3, -1.], [7, 14, 4, 1, 3.]], threshold: -0.0128290103748441, right_val: 0.4660735130310059, left_val: 0.7712153792381287 }, { features: [[18, 0, 2, 6, -1.], [18, 2, 2, 2, 3.]], threshold: -9.3660065904259682e-003, right_val: 0.5351287722587585, left_val: 0.3374983966350555 }, { features: [[0, 0, 2, 6, -1.], [0, 2, 2, 2, 3.]], threshold: 3.2452319283038378e-003, right_val: 0.3289610147476196, left_val: 0.5325189828872681 }, { features: [[8, 14, 6, 3, -1.], [8, 15, 6, 1, 3.]], threshold: -0.0117235602810979, right_val: 0.4754300117492676, left_val: 0.6837652921676636 }, { features: [[7, 4, 2, 4, -1.], [8, 4, 1, 4, 2.]], threshold: 2.9257940695970319e-005, right_val: 0.5360502004623413, left_val: 0.3572087883949280 }, { features: [[8, 5, 4, 6, -1.], [8, 7, 4, 2, 3.]], threshold: -2.2244219508138485e-005, right_val: 0.3552064001560211, left_val: 0.5541427135467529 }, { features: [[6, 4, 2, 2, -1.], [7, 4, 1, 2, 2.]], threshold: 5.0881509669125080e-003, right_val: 0.1256462037563324, left_val: 0.5070844292640686 }, { features: [[3, 14, 14, 4, -1.], [10, 14, 7, 2, 2.], [3, 16, 7, 2, 2.]], threshold: 0.0274296794086695, right_val: 0.1625818014144898, left_val: 0.5269560217857361 }, { features: [[6, 15, 6, 2, -1.], [6, 15, 3, 1, 2.], [9, 16, 3, 1, 2.]], threshold: -6.4142867922782898e-003, right_val: 0.4584197103977203, left_val: 0.7145588994026184 }, { features: [[14, 15, 6, 2, -1.], [14, 16, 6, 1, 2.]], threshold: 3.3479959238320589e-003, right_val: 0.3494696915149689, left_val: 0.5398612022399902 }, { features: [[2, 12, 12, 8, -1.], [2, 16, 12, 4, 2.]], threshold: -0.0826354920864105, right_val: 0.5160226225852966, left_val: 0.2439192980527878 }, { features: [[7, 7, 7, 2, -1.], [7, 8, 7, 1, 2.]], threshold: 1.0261740535497665e-003, right_val: 0.5767908096313477, left_val: 0.3886891901493073 }, { features: [[0, 2, 18, 2, -1.], [0, 3, 18, 1, 2.]], threshold: -1.6307090409100056e-003, right_val: 0.5347700715065002, left_val: 0.3389458060264587 }, { features: [[9, 6, 2, 5, -1.], [9, 6, 1, 5, 2.]], threshold: 2.4546680506318808e-003, right_val: 0.6387246847152710, left_val: 0.4601413905620575 }, { features: [[7, 5, 3, 8, -1.], [8, 5, 1, 8, 3.]], threshold: -9.9476519972085953e-004, right_val: 0.4120396077632904, left_val: 0.5769879221916199 }, { features: [[9, 6, 3, 4, -1.], [10, 6, 1, 4, 3.]], threshold: 0.0154091902077198, right_val: 0.7089822292327881, left_val: 0.4878709018230438 }, { features: [[4, 13, 3, 2, -1.], [4, 14, 3, 1, 2.]], threshold: 1.1784400558099151e-003, right_val: 0.2895244956016541, left_val: 0.5263553261756897 }, { features: [[9, 4, 6, 3, -1.], [11, 4, 2, 3, 3.]], threshold: -0.0277019198983908, right_val: 0.5219606757164002, left_val: 0.1498828977346420 }, { features: [[5, 4, 6, 3, -1.], [7, 4, 2, 3, 3.]], threshold: -0.0295053999871016, right_val: 0.4999816119670868, left_val: 0.0248933192342520 }, { features: [[14, 11, 5, 2, -1.], [14, 12, 5, 1, 2.]], threshold: 4.5159430010244250e-004, right_val: 0.4029662907123566, left_val: 0.5464622974395752 }, { features: [[1, 2, 6, 9, -1.], [3, 2, 2, 9, 3.]], threshold: 7.1772639639675617e-003, right_val: 0.5866296887397766, left_val: 0.4271056950092316 }, { features: [[14, 6, 6, 13, -1.], [14, 6, 3, 13, 2.]], threshold: -0.0741820484399796, right_val: 0.4919027984142304, left_val: 0.6874179244041443 }, { features: [[3, 6, 14, 8, -1.], [3, 6, 7, 4, 2.], [10, 10, 7, 4, 2.]], threshold: -0.0172541607171297, right_val: 0.5348739027976990, left_val: 0.3370676040649414 }, { features: [[16, 0, 4, 11, -1.], [16, 0, 2, 11, 2.]], threshold: 0.0148515598848462, right_val: 0.6129904985427856, left_val: 0.4626792967319489 }, { features: [[3, 4, 12, 12, -1.], [3, 4, 6, 6, 2.], [9, 10, 6, 6, 2.]], threshold: 0.0100020002573729, right_val: 0.3423453867435455, left_val: 0.5346122980117798 }, { features: [[11, 4, 5, 3, -1.], [11, 5, 5, 1, 3.]], threshold: 2.0138120744377375e-003, right_val: 0.5824304223060608, left_val: 0.4643830060958862 }, { features: [[4, 11, 4, 2, -1.], [4, 12, 4, 1, 2.]], threshold: 1.5135470312088728e-003, right_val: 0.2856149971485138, left_val: 0.5196396112442017 }, { features: [[10, 7, 2, 2, -1.], [10, 7, 1, 2, 2.]], threshold: 3.1381431035697460e-003, right_val: 0.5958529710769653, left_val: 0.4838162958621979 }, { features: [[8, 7, 2, 2, -1.], [9, 7, 1, 2, 2.]], threshold: -5.1450440660119057e-003, right_val: 0.4741412103176117, left_val: 0.8920302987098694 }, { features: [[9, 17, 3, 2, -1.], [10, 17, 1, 2, 3.]], threshold: -4.4736708514392376e-003, right_val: 0.5337278842926025, left_val: 0.2033942937850952 }, { features: [[5, 6, 3, 3, -1.], [5, 7, 3, 1, 3.]], threshold: 1.9628470763564110e-003, right_val: 0.6725863218307495, left_val: 0.4571633934974670 }, { features: [[10, 0, 3, 3, -1.], [11, 0, 1, 3, 3.]], threshold: 5.4260450415313244e-003, right_val: 0.2845670878887177, left_val: 0.5271108150482178 }, { features: [[5, 6, 6, 2, -1.], [5, 6, 3, 1, 2.], [8, 7, 3, 1, 2.]], threshold: 4.9611460417509079e-004, right_val: 0.5718597769737244, left_val: 0.4138312935829163 }, { features: [[12, 16, 4, 3, -1.], [12, 17, 4, 1, 3.]], threshold: 9.3728788197040558e-003, right_val: 0.2804847061634064, left_val: 0.5225151181221008 }, { features: [[3, 12, 3, 2, -1.], [3, 13, 3, 1, 2.]], threshold: 6.0500897234305739e-004, right_val: 0.3314523994922638, left_val: 0.5236768722534180 }, { features: [[9, 12, 3, 2, -1.], [9, 13, 3, 1, 2.]], threshold: 5.6792551185935736e-004, right_val: 0.6276971101760864, left_val: 0.4531059861183167 }, { features: [[1, 11, 16, 4, -1.], [1, 11, 8, 2, 2.], [9, 13, 8, 2, 2.]], threshold: 0.0246443394571543, right_val: 0.2017143964767456, left_val: 0.5130851864814758 }, { features: [[12, 4, 3, 3, -1.], [12, 5, 3, 1, 3.]], threshold: -0.0102904504165053, right_val: 0.4876641035079956, left_val: 0.7786595225334168 }, { features: [[4, 4, 5, 3, -1.], [4, 5, 5, 1, 3.]], threshold: 2.0629419013857841e-003, right_val: 0.5881264209747315, left_val: 0.4288598895072937 }, { features: [[12, 16, 4, 3, -1.], [12, 17, 4, 1, 3.]], threshold: -5.0519481301307678e-003, right_val: 0.5286008715629578, left_val: 0.3523977994918823 }, { features: [[5, 4, 3, 3, -1.], [5, 5, 3, 1, 3.]], threshold: -5.7692620903253555e-003, right_val: 0.4588094055652618, left_val: 0.6841086149215698 }, { features: [[9, 0, 2, 2, -1.], [9, 1, 2, 1, 2.]], threshold: -4.5789941214025021e-004, right_val: 0.5485978126525879, left_val: 0.3565520048141480 }, { features: [[8, 9, 4, 2, -1.], [8, 10, 4, 1, 2.]], threshold: -7.5918837683275342e-004, right_val: 0.5254197120666504, left_val: 0.3368793129920960 }, { features: [[8, 8, 4, 3, -1.], [8, 9, 4, 1, 3.]], threshold: -1.7737259622663260e-003, right_val: 0.5454015135765076, left_val: 0.3422161042690277 }, { features: [[0, 13, 6, 3, -1.], [2, 13, 2, 3, 3.]], threshold: -8.5610467940568924e-003, right_val: 0.4485856890678406, left_val: 0.6533612012863159 }, { features: [[16, 14, 3, 2, -1.], [16, 15, 3, 1, 2.]], threshold: 1.7277270089834929e-003, right_val: 0.3925352990627289, left_val: 0.5307580232620239 }, { features: [[1, 18, 18, 2, -1.], [7, 18, 6, 2, 3.]], threshold: -0.0281996093690395, right_val: 0.4588584005832672, left_val: 0.6857458949089050 }, { features: [[16, 14, 3, 2, -1.], [16, 15, 3, 1, 2.]], threshold: -1.7781109781935811e-003, right_val: 0.5369856953620911, left_val: 0.4037851095199585 }, { features: [[1, 14, 3, 2, -1.], [1, 15, 3, 1, 2.]], threshold: 3.3177141449414194e-004, right_val: 0.3705750107765198, left_val: 0.5399798750877380 }, { features: [[7, 14, 6, 3, -1.], [7, 15, 6, 1, 3.]], threshold: 2.6385399978607893e-003, right_val: 0.6452730894088745, left_val: 0.4665437042713165 }, { features: [[5, 14, 8, 3, -1.], [5, 15, 8, 1, 3.]], threshold: -2.1183069329708815e-003, right_val: 0.4064677059650421, left_val: 0.5914781093597412 }, { features: [[10, 6, 4, 14, -1.], [10, 6, 2, 14, 2.]], threshold: -0.0147732896730304, right_val: 0.5294762849807739, left_val: 0.3642038106918335 }, { features: [[6, 6, 4, 14, -1.], [8, 6, 2, 14, 2.]], threshold: -0.0168154407292604, right_val: 0.5144972801208496, left_val: 0.2664231956005096 }, { features: [[13, 5, 2, 3, -1.], [13, 6, 2, 1, 3.]], threshold: -6.3370140269398689e-003, right_val: 0.4852097928524017, left_val: 0.6779531240463257 }, { features: [[7, 16, 6, 1, -1.], [9, 16, 2, 1, 3.]], threshold: -4.4560048991115764e-005, right_val: 0.4153054058551788, left_val: 0.5613964796066284 }, { features: [[9, 12, 3, 3, -1.], [9, 13, 3, 1, 3.]], threshold: -1.0240620467811823e-003, right_val: 0.4566304087638855, left_val: 0.5964478254318237 }, { features: [[7, 0, 3, 3, -1.], [8, 0, 1, 3, 3.]], threshold: -2.3161689750850201e-003, right_val: 0.5188159942626953, left_val: 0.2976115047931671 }, { features: [[4, 0, 16, 18, -1.], [4, 9, 16, 9, 2.]], threshold: 0.5321757197380066, right_val: 0.2202631980180740, left_val: 0.5187839269638062 }, { features: [[1, 1, 16, 14, -1.], [1, 8, 16, 7, 2.]], threshold: -0.1664305031299591, right_val: 0.5060343146324158, left_val: 0.1866022944450378 }, { features: [[3, 9, 15, 4, -1.], [8, 9, 5, 4, 3.]], threshold: 0.1125352978706360, right_val: 0.1185022965073586, left_val: 0.5212125182151794 }, { features: [[6, 12, 7, 3, -1.], [6, 13, 7, 1, 3.]], threshold: 9.3046864494681358e-003, right_val: 0.6826149225234985, left_val: 0.4589937031269074 }, { features: [[14, 15, 2, 3, -1.], [14, 16, 2, 1, 3.]], threshold: -4.6255099587142467e-003, right_val: 0.5225008726119995, left_val: 0.3079940974712372 }, { features: [[2, 3, 16, 14, -1.], [2, 3, 8, 7, 2.], [10, 10, 8, 7, 2.]], threshold: -0.1111646965146065, right_val: 0.5080801844596863, left_val: 0.2101044058799744 }, { features: [[16, 2, 4, 18, -1.], [18, 2, 2, 9, 2.], [16, 11, 2, 9, 2.]], threshold: -0.0108884396031499, right_val: 0.4790464043617249, left_val: 0.5765355229377747 }, { features: [[4, 15, 2, 3, -1.], [4, 16, 2, 1, 3.]], threshold: 5.8564301580190659e-003, right_val: 0.1563598960638046, left_val: 0.5065100193023682 }, { features: [[16, 2, 4, 18, -1.], [18, 2, 2, 9, 2.], [16, 11, 2, 9, 2.]], threshold: 0.0548543892800808, right_val: 0.7230510711669922, left_val: 0.4966914951801300 }, { features: [[1, 1, 8, 3, -1.], [1, 2, 8, 1, 3.]], threshold: -0.0111973397433758, right_val: 0.5098798274993897, left_val: 0.2194979041814804 }, { features: [[8, 11, 4, 3, -1.], [8, 12, 4, 1, 3.]], threshold: 4.4069071300327778e-003, right_val: 0.6770902872085571, left_val: 0.4778401851654053 }, { features: [[5, 11, 5, 9, -1.], [5, 14, 5, 3, 3.]], threshold: -0.0636652931571007, right_val: 0.5081024169921875, left_val: 0.1936362981796265 }, { features: [[16, 0, 4, 11, -1.], [16, 0, 2, 11, 2.]], threshold: -9.8081491887569427e-003, right_val: 0.4810341000556946, left_val: 0.5999063253402710 }, { features: [[7, 0, 6, 1, -1.], [9, 0, 2, 1, 3.]], threshold: -2.1717099007219076e-003, right_val: 0.5235472917556763, left_val: 0.3338333964347839 }, { features: [[16, 3, 3, 7, -1.], [17, 3, 1, 7, 3.]], threshold: -0.0133155202493072, right_val: 0.4919213056564331, left_val: 0.6617069840431213 }, { features: [[1, 3, 3, 7, -1.], [2, 3, 1, 7, 3.]], threshold: 2.5442079640924931e-003, right_val: 0.6082184910774231, left_val: 0.4488744139671326 }, { features: [[7, 8, 6, 12, -1.], [7, 12, 6, 4, 3.]], threshold: 0.0120378397405148, right_val: 0.3292432129383087, left_val: 0.5409392118453980 }, { features: [[0, 0, 4, 11, -1.], [2, 0, 2, 11, 2.]], threshold: -0.0207010507583618, right_val: 0.4594995975494385, left_val: 0.6819120049476624 }, { features: [[14, 0, 6, 20, -1.], [14, 0, 3, 20, 2.]], threshold: 0.0276082791388035, right_val: 0.5767282843589783, left_val: 0.4630792140960693 }, { features: [[0, 3, 1, 2, -1.], [0, 4, 1, 1, 2.]], threshold: 1.2370620388537645e-003, right_val: 0.2635016143321991, left_val: 0.5165379047393799 }, { features: [[5, 5, 10, 8, -1.], [10, 5, 5, 4, 2.], [5, 9, 5, 4, 2.]], threshold: -0.0376693382859230, right_val: 0.5278980135917664, left_val: 0.2536393105983734 }, { features: [[4, 7, 12, 4, -1.], [4, 7, 6, 2, 2.], [10, 9, 6, 2, 2.]], threshold: -1.8057259730994701e-003, right_val: 0.5517500042915344, left_val: 0.3985156118869782 }], threshold: 50.6104812622070310 }, { simpleClassifiers: [{ features: [[2, 1, 6, 4, -1.], [5, 1, 3, 4, 2.]], threshold: 4.4299028813838959e-003, right_val: 0.6335226297378540, left_val: 0.2891018092632294 }, { features: [[9, 7, 6, 4, -1.], [12, 7, 3, 2, 2.], [9, 9, 3, 2, 2.]], threshold: -2.3813319858163595e-003, right_val: 0.3477487862110138, left_val: 0.6211789250373840 }, { features: [[5, 6, 2, 6, -1.], [5, 9, 2, 3, 2.]], threshold: 2.2915711160749197e-003, right_val: 0.5582118034362793, left_val: 0.2254412025213242 }, { features: [[9, 16, 6, 4, -1.], [12, 16, 3, 2, 2.], [9, 18, 3, 2, 2.]], threshold: 9.9457940086722374e-004, right_val: 0.5930070877075195, left_val: 0.3711710870265961 }, { features: [[9, 4, 2, 12, -1.], [9, 10, 2, 6, 2.]], threshold: 7.7164667891338468e-004, right_val: 0.3347995877265930, left_val: 0.5651720166206360 }, { features: [[7, 1, 6, 18, -1.], [9, 1, 2, 18, 3.]], threshold: -1.1386410333216190e-003, right_val: 0.5508630871772766, left_val: 0.3069126009941101 }, { features: [[4, 12, 12, 2, -1.], [8, 12, 4, 2, 3.]], threshold: -1.6403039626311511e-004, right_val: 0.3699047863483429, left_val: 0.5762827992439270 }, { features: [[8, 8, 6, 2, -1.], [8, 9, 6, 1, 2.]], threshold: 2.9793529392918572e-005, right_val: 0.5437911152839661, left_val: 0.2644244134426117 }, { features: [[8, 0, 3, 6, -1.], [9, 0, 1, 6, 3.]], threshold: 8.5774902254343033e-003, right_val: 0.1795724928379059, left_val: 0.5051138997077942 }, { features: [[11, 18, 3, 2, -1.], [11, 19, 3, 1, 2.]], threshold: -2.6032689493149519e-004, right_val: 0.4446826875209808, left_val: 0.5826969146728516 }, { features: [[1, 1, 17, 4, -1.], [1, 3, 17, 2, 2.]], threshold: -6.1404630541801453e-003, right_val: 0.5346971750259399, left_val: 0.3113852143287659 }, { features: [[11, 8, 4, 12, -1.], [11, 8, 2, 12, 2.]], threshold: -0.0230869501829147, right_val: 0.5331197977066040, left_val: 0.3277946114540100 }, { features: [[8, 14, 4, 3, -1.], [8, 15, 4, 1, 3.]], threshold: -0.0142436502501369, right_val: 0.4588063061237335, left_val: 0.7381709814071655 }, { features: [[12, 3, 2, 17, -1.], [12, 3, 1, 17, 2.]], threshold: 0.0194871295243502, right_val: 0.2274471968412399, left_val: 0.5256630778312683 }, { features: [[4, 7, 6, 1, -1.], [6, 7, 2, 1, 3.]], threshold: -9.6681108698248863e-004, right_val: 0.3815006911754608, left_val: 0.5511230826377869 }, { features: [[18, 3, 2, 3, -1.], [18, 4, 2, 1, 3.]], threshold: 3.1474709976464510e-003, right_val: 0.2543726861476898, left_val: 0.5425636768341065 }, { features: [[8, 4, 3, 4, -1.], [8, 6, 3, 2, 2.]], threshold: -1.8026070029009134e-004, right_val: 0.3406304121017456, left_val: 0.5380191802978516 }, { features: [[4, 5, 12, 10, -1.], [4, 10, 12, 5, 2.]], threshold: -6.0266260989010334e-003, right_val: 0.5420572161674500, left_val: 0.3035801947116852 }, { features: [[5, 18, 4, 2, -1.], [7, 18, 2, 2, 2.]], threshold: 4.4462960795499384e-004, right_val: 0.5660110116004944, left_val: 0.3990997076034546 }, { features: [[17, 2, 3, 6, -1.], [17, 4, 3, 2, 3.]], threshold: 2.2609760053455830e-003, right_val: 0.3940688073635101, left_val: 0.5562806725502014 }, { features: [[7, 7, 6, 6, -1.], [9, 7, 2, 6, 3.]], threshold: 0.0511330589652061, right_val: 0.7118561863899231, left_val: 0.4609653949737549 }, { features: [[17, 2, 3, 6, -1.], [17, 4, 3, 2, 3.]], threshold: -0.0177863091230392, right_val: 0.5322144031524658, left_val: 0.2316166013479233 }, { features: [[8, 0, 3, 4, -1.], [9, 0, 1, 4, 3.]], threshold: -4.9679628573358059e-003, right_val: 0.5122029185295105, left_val: 0.2330771982669830 }, { features: [[9, 14, 2, 3, -1.], [9, 15, 2, 1, 3.]], threshold: 2.0667689386755228e-003, right_val: 0.6455488204956055, left_val: 0.4657444059848785 }, { features: [[0, 12, 6, 3, -1.], [0, 13, 6, 1, 3.]], threshold: 7.4413768015801907e-003, right_val: 0.2361633926630020, left_val: 0.5154392123222351 }, { features: [[8, 14, 4, 3, -1.], [8, 15, 4, 1, 3.]], threshold: -3.6277279723435640e-003, right_val: 0.4476661086082459, left_val: 0.6219773292541504 }, { features: [[3, 12, 2, 3, -1.], [3, 13, 2, 1, 3.]], threshold: -5.3530759178102016e-003, right_val: 0.5102208256721497, left_val: 0.1837355047464371 }, { features: [[5, 6, 12, 7, -1.], [9, 6, 4, 7, 3.]], threshold: 0.1453091949224472, right_val: 0.1535930931568146, left_val: 0.5145987272262573 }, { features: [[0, 2, 3, 6, -1.], [0, 4, 3, 2, 3.]], threshold: 2.4394490756094456e-003, right_val: 0.3624661862850189, left_val: 0.5343660116195679 }, { features: [[14, 6, 1, 3, -1.], [14, 7, 1, 1, 3.]], threshold: -3.1283390708267689e-003, right_val: 0.4845592081546783, left_val: 0.6215007901191711 }, { features: [[2, 0, 3, 14, -1.], [3, 0, 1, 14, 3.]], threshold: 1.7940260004252195e-003, right_val: 0.5824198126792908, left_val: 0.4299261868000031 }, { features: [[12, 14, 5, 6, -1.], [12, 16, 5, 2, 3.]], threshold: 0.0362538211047649, right_val: 0.1439467966556549, left_val: 0.5260334014892578 }, { features: [[4, 14, 5, 6, -1.], [4, 16, 5, 2, 3.]], threshold: -5.1746722310781479e-003, right_val: 0.5287045240402222, left_val: 0.3506538867950440 }, { features: [[11, 10, 2, 2, -1.], [12, 10, 1, 1, 2.], [11, 11, 1, 1, 2.]], threshold: 6.5383297624066472e-004, right_val: 0.6122040152549744, left_val: 0.4809640944004059 }, { features: [[5, 0, 3, 14, -1.], [6, 0, 1, 14, 3.]], threshold: -0.0264802295714617, right_val: 0.5045586228370667, left_val: 0.1139362007379532 }, { features: [[10, 15, 2, 3, -1.], [10, 16, 2, 1, 3.]], threshold: -3.0440660193562508e-003, right_val: 0.4794734120368958, left_val: 0.6352095007896423 }, { features: [[0, 2, 2, 3, -1.], [0, 3, 2, 1, 3.]], threshold: 3.6993520334362984e-003, right_val: 0.2498510926961899, left_val: 0.5131118297576904 }, { features: [[5, 11, 12, 6, -1.], [5, 14, 12, 3, 2.]], threshold: -3.6762931267730892e-004, right_val: 0.3709532022476196, left_val: 0.5421394705772400 }, { features: [[6, 11, 3, 9, -1.], [6, 14, 3, 3, 3.]], threshold: -0.0413822606205940, right_val: 0.5081691741943359, left_val: 0.1894959956407547 }, { features: [[11, 10, 2, 2, -1.], [12, 10, 1, 1, 2.], [11, 11, 1, 1, 2.]], threshold: -1.0532729793339968e-003, right_val: 0.4783608913421631, left_val: 0.6454367041587830 }, { features: [[5, 6, 1, 3, -1.], [5, 7, 1, 1, 3.]], threshold: -2.1648600231856108e-003, right_val: 0.4499826133251190, left_val: 0.6215031147003174 }, { features: [[4, 9, 13, 3, -1.], [4, 10, 13, 1, 3.]], threshold: -5.6747748749330640e-004, right_val: 0.5419334769248962, left_val: 0.3712610900402069 }, { features: [[1, 7, 15, 6, -1.], [6, 7, 5, 6, 3.]], threshold: 0.1737584024667740, right_val: 0.1215742006897926, left_val: 0.5023643970489502 }, { features: [[4, 5, 12, 6, -1.], [8, 5, 4, 6, 3.]], threshold: -2.9049699660390615e-003, right_val: 0.5381883978843689, left_val: 0.3240267932415009 }, { features: [[8, 10, 4, 3, -1.], [8, 11, 4, 1, 3.]], threshold: 1.2299539521336555e-003, right_val: 0.5703486204147339, left_val: 0.4165507853031158 }, { features: [[15, 14, 1, 3, -1.], [15, 15, 1, 1, 3.]], threshold: -5.4329237900674343e-004, right_val: 0.5547549128532410, left_val: 0.3854042887687683 }, { features: [[1, 11, 5, 3, -1.], [1, 12, 5, 1, 3.]], threshold: -8.3297258242964745e-003, right_val: 0.5097082853317261, left_val: 0.2204494029283524 }, { features: [[7, 1, 7, 12, -1.], [7, 7, 7, 6, 2.]], threshold: -1.0417630255687982e-004, right_val: 0.4303036034107208, left_val: 0.5607066154479981 }, { features: [[0, 1, 6, 10, -1.], [0, 1, 3, 5, 2.], [3, 6, 3, 5, 2.]], threshold: 0.0312047004699707, right_val: 0.6982004046440125, left_val: 0.4621657133102417 }, { features: [[16, 1, 4, 3, -1.], [16, 2, 4, 1, 3.]], threshold: 7.8943502157926559e-003, right_val: 0.2269068062305450, left_val: 0.5269594192504883 }, { features: [[5, 5, 2, 3, -1.], [5, 6, 2, 1, 3.]], threshold: -4.3645310215651989e-003, right_val: 0.4537956118583679, left_val: 0.6359223127365112 }, { features: [[12, 2, 3, 5, -1.], [13, 2, 1, 5, 3.]], threshold: 7.6793059706687927e-003, right_val: 0.2740483880043030, left_val: 0.5274767875671387 }, { features: [[0, 3, 4, 6, -1.], [0, 5, 4, 2, 3.]], threshold: -0.0254311393946409, right_val: 0.5071732997894287, left_val: 0.2038519978523254 }, { features: [[8, 12, 4, 2, -1.], [8, 13, 4, 1, 2.]], threshold: 8.2000601105391979e-004, right_val: 0.6119868159294128, left_val: 0.4587455093860626 }, { features: [[8, 18, 3, 1, -1.], [9, 18, 1, 1, 3.]], threshold: 2.9284600168466568e-003, right_val: 0.2028204947710037, left_val: 0.5071274042129517 }, { features: [[11, 10, 2, 2, -1.], [12, 10, 1, 1, 2.], [11, 11, 1, 1, 2.]], threshold: 4.5256470912136137e-005, right_val: 0.5430821776390076, left_val: 0.4812104105949402 }, { features: [[7, 10, 2, 2, -1.], [7, 10, 1, 1, 2.], [8, 11, 1, 1, 2.]], threshold: 1.3158309739083052e-003, right_val: 0.6779323220252991, left_val: 0.4625813961029053 }, { features: [[11, 11, 4, 4, -1.], [11, 13, 4, 2, 2.]], threshold: 1.5870389761403203e-003, right_val: 0.3431465029716492, left_val: 0.5386291742324829 }, { features: [[8, 12, 3, 8, -1.], [9, 12, 1, 8, 3.]], threshold: -0.0215396601706743, right_val: 0.5003222823143005, left_val: 0.0259425006806850 }, { features: [[13, 0, 6, 3, -1.], [13, 1, 6, 1, 3.]], threshold: 0.0143344802781940, right_val: 0.1590632945299149, left_val: 0.5202844738960266 }, { features: [[8, 8, 3, 4, -1.], [9, 8, 1, 4, 3.]], threshold: -8.3881383761763573e-003, right_val: 0.4648044109344482, left_val: 0.7282481193542481 }, { features: [[5, 7, 10, 10, -1.], [10, 7, 5, 5, 2.], [5, 12, 5, 5, 2.]], threshold: 9.1906841844320297e-003, right_val: 0.3923191130161285, left_val: 0.5562356710433960 }, { features: [[3, 18, 8, 2, -1.], [3, 18, 4, 1, 2.], [7, 19, 4, 1, 2.]], threshold: -5.8453059755265713e-003, right_val: 0.4629127979278565, left_val: 0.6803392767906189 }, { features: [[10, 2, 6, 8, -1.], [12, 2, 2, 8, 3.]], threshold: -0.0547077991068363, right_val: 0.5206125974655151, left_val: 0.2561671137809753 }, { features: [[4, 2, 6, 8, -1.], [6, 2, 2, 8, 3.]], threshold: 9.1142775490880013e-003, right_val: 0.3053877055644989, left_val: 0.5189620256423950 }, { features: [[11, 0, 3, 7, -1.], [12, 0, 1, 7, 3.]], threshold: -0.0155750000849366, right_val: 0.5169094800949097, left_val: 0.1295074969530106 }, { features: [[7, 11, 2, 1, -1.], [8, 11, 1, 1, 2.]], threshold: -1.2050600344082341e-004, right_val: 0.4230825006961823, left_val: 0.5735098123550415 }, { features: [[15, 14, 1, 3, -1.], [15, 15, 1, 1, 3.]], threshold: 1.2273970060050488e-003, right_val: 0.4079791903495789, left_val: 0.5289878249168396 }, { features: [[7, 15, 2, 2, -1.], [7, 15, 1, 1, 2.], [8, 16, 1, 1, 2.]], threshold: -1.2186600361019373e-003, right_val: 0.4574409127235413, left_val: 0.6575639843940735 }, { features: [[15, 14, 1, 3, -1.], [15, 15, 1, 1, 3.]], threshold: -3.3256649039685726e-003, right_val: 0.5195019841194153, left_val: 0.3628047108650208 }, { features: [[6, 0, 3, 7, -1.], [7, 0, 1, 7, 3.]], threshold: -0.0132883097976446, right_val: 0.5043488740921021, left_val: 0.1284265965223312 }, { features: [[18, 1, 2, 7, -1.], [18, 1, 1, 7, 2.]], threshold: -3.3839771058410406e-003, right_val: 0.4757505953311920, left_val: 0.6292240023612976 }, { features: [[2, 0, 8, 20, -1.], [2, 10, 8, 10, 2.]], threshold: -0.2195422053337097, right_val: 0.5065013766288757, left_val: 0.1487731933593750 }, { features: [[3, 0, 15, 6, -1.], [3, 2, 15, 2, 3.]], threshold: 4.9111708067357540e-003, right_val: 0.5665838718414307, left_val: 0.4256102144718170 }, { features: [[4, 3, 12, 2, -1.], [4, 4, 12, 1, 2.]], threshold: -1.8744950648397207e-004, right_val: 0.5586857199668884, left_val: 0.4004144072532654 }, { features: [[16, 0, 4, 5, -1.], [16, 0, 2, 5, 2.]], threshold: -5.2178641781210899e-003, right_val: 0.4812706112861633, left_val: 0.6009116172790527 }, { features: [[7, 0, 3, 4, -1.], [8, 0, 1, 4, 3.]], threshold: -1.1111519997939467e-003, right_val: 0.5287089943885803, left_val: 0.3514933884143829 }, { features: [[16, 0, 4, 5, -1.], [16, 0, 2, 5, 2.]], threshold: 4.4036400504410267e-003, right_val: 0.5924085974693298, left_val: 0.4642275869846344 }, { features: [[1, 7, 6, 13, -1.], [3, 7, 2, 13, 3.]], threshold: 0.1229949966073036, right_val: 0.0691524818539619, left_val: 0.5025529265403748 }, { features: [[16, 0, 4, 5, -1.], [16, 0, 2, 5, 2.]], threshold: -0.0123135102912784, right_val: 0.4934012889862061, left_val: 0.5884591937065125 }, { features: [[0, 0, 4, 5, -1.], [2, 0, 2, 5, 2.]], threshold: 4.1471039876341820e-003, right_val: 0.5893477797508240, left_val: 0.4372239112854004 }, { features: [[14, 12, 3, 6, -1.], [14, 14, 3, 2, 3.]], threshold: -3.5502649843692780e-003, right_val: 0.5396270155906677, left_val: 0.4327551126480103 }, { features: [[3, 12, 3, 6, -1.], [3, 14, 3, 2, 3.]], threshold: -0.0192242693156004, right_val: 0.5068330764770508, left_val: 0.1913134008646011 }, { features: [[16, 1, 4, 3, -1.], [16, 2, 4, 1, 3.]], threshold: 1.4395059552043676e-003, right_val: 0.4243533015251160, left_val: 0.5308178067207336 }, { features: [[8, 7, 2, 10, -1.], [8, 7, 1, 5, 2.], [9, 12, 1, 5, 2.]], threshold: -6.7751999013125896e-003, right_val: 0.4540086090564728, left_val: 0.6365395784378052 }, { features: [[11, 11, 4, 4, -1.], [11, 13, 4, 2, 2.]], threshold: 7.0119630545377731e-003, right_val: 0.3026199936866760, left_val: 0.5189834237098694 }, { features: [[0, 1, 4, 3, -1.], [0, 2, 4, 1, 3.]], threshold: 5.4014651104807854e-003, right_val: 0.2557682991027832, left_val: 0.5105062127113342 }, { features: [[13, 4, 1, 3, -1.], [13, 5, 1, 1, 3.]], threshold: 9.0274988906458020e-004, right_val: 0.5861827731132507, left_val: 0.4696914851665497 }, { features: [[7, 15, 3, 5, -1.], [8, 15, 1, 5, 3.]], threshold: 0.0114744501188397, right_val: 0.1527177989482880, left_val: 0.5053645968437195 }, { features: [[9, 7, 3, 5, -1.], [10, 7, 1, 5, 3.]], threshold: -6.7023430019617081e-003, right_val: 0.4890604019165039, left_val: 0.6508980989456177 }, { features: [[8, 7, 3, 5, -1.], [9, 7, 1, 5, 3.]], threshold: -2.0462959073483944e-003, right_val: 0.4514600038528442, left_val: 0.6241816878318787 }, { features: [[10, 6, 4, 14, -1.], [10, 6, 2, 14, 2.]], threshold: -9.9951568990945816e-003, right_val: 0.5400953888893127, left_val: 0.3432781100273132 }, { features: [[0, 5, 5, 6, -1.], [0, 7, 5, 2, 3.]], threshold: -0.0357007086277008, right_val: 0.5074077844619751, left_val: 0.1878059059381485 }, { features: [[9, 5, 6, 4, -1.], [9, 5, 3, 4, 2.]], threshold: 4.5584561303257942e-004, right_val: 0.5402569770812988, left_val: 0.3805277049541473 }, { features: [[0, 0, 18, 10, -1.], [6, 0, 6, 10, 3.]], threshold: -0.0542606003582478, right_val: 0.4595097005367279, left_val: 0.6843714714050293 }, { features: [[10, 6, 4, 14, -1.], [10, 6, 2, 14, 2.]], threshold: 6.0600461438298225e-003, right_val: 0.4500527977943420, left_val: 0.5502905249595642 }, { features: [[6, 6, 4, 14, -1.], [8, 6, 2, 14, 2.]], threshold: -6.4791832119226456e-003, right_val: 0.5310757160186768, left_val: 0.3368858098983765 }, { features: [[13, 4, 1, 3, -1.], [13, 5, 1, 1, 3.]], threshold: -1.4939469983801246e-003, right_val: 0.4756175875663757, left_val: 0.6487640142440796 }, { features: [[5, 1, 2, 3, -1.], [6, 1, 1, 3, 2.]], threshold: 1.4610530342906713e-005, right_val: 0.5451064109802246, left_val: 0.4034579098224640 }, { features: [[18, 1, 2, 18, -1.], [19, 1, 1, 9, 2.], [18, 10, 1, 9, 2.]], threshold: -7.2321938350796700e-003, right_val: 0.4824739992618561, left_val: 0.6386873722076416 }, { features: [[2, 1, 4, 3, -1.], [2, 2, 4, 1, 3.]], threshold: -4.0645818226039410e-003, right_val: 0.5157335996627808, left_val: 0.2986421883106232 }, { features: [[18, 1, 2, 18, -1.], [19, 1, 1, 9, 2.], [18, 10, 1, 9, 2.]], threshold: 0.0304630808532238, right_val: 0.7159956097602844, left_val: 0.5022199749946594 }, { features: [[1, 14, 4, 6, -1.], [1, 14, 2, 3, 2.], [3, 17, 2, 3, 2.]], threshold: -8.0544911324977875e-003, right_val: 0.4619275033473969, left_val: 0.6492452025413513 }, { features: [[10, 11, 7, 6, -1.], [10, 13, 7, 2, 3.]], threshold: 0.0395051389932632, right_val: 0.2450613975524902, left_val: 0.5150570869445801 }, { features: [[0, 10, 6, 10, -1.], [0, 10, 3, 5, 2.], [3, 15, 3, 5, 2.]], threshold: 8.4530208259820938e-003, right_val: 0.6394037008285523, left_val: 0.4573669135570526 }, { features: [[11, 0, 3, 4, -1.], [12, 0, 1, 4, 3.]], threshold: -1.1688120430335402e-003, right_val: 0.5483661293983460, left_val: 0.3865512013435364 }, { features: [[5, 10, 5, 6, -1.], [5, 13, 5, 3, 2.]], threshold: 2.8070670086890459e-003, right_val: 0.2701480090618134, left_val: 0.5128579139709473 }, { features: [[14, 6, 1, 8, -1.], [14, 10, 1, 4, 2.]], threshold: 4.7365209320560098e-004, right_val: 0.5387461185455322, left_val: 0.4051581919193268 }, { features: [[1, 7, 18, 6, -1.], [1, 7, 9, 3, 2.], [10, 10, 9, 3, 2.]], threshold: 0.0117410803213716, right_val: 0.3719413876533508, left_val: 0.5295950174331665 }, { features: [[9, 7, 2, 2, -1.], [9, 7, 1, 2, 2.]], threshold: 3.1833238899707794e-003, right_val: 0.6895126104354858, left_val: 0.4789406955242157 }, { features: [[5, 9, 4, 5, -1.], [7, 9, 2, 5, 2.]], threshold: 7.0241501089185476e-004, right_val: 0.3918080925941467, left_val: 0.5384489297866821 }], threshold: 54.6200714111328130 }, { simpleClassifiers: [{ features: [[7, 6, 6, 3, -1.], [9, 6, 2, 3, 3.]], threshold: 0.0170599296689034, right_val: 0.7142534852027893, left_val: 0.3948527872562408 }, { features: [[1, 0, 18, 4, -1.], [7, 0, 6, 4, 3.]], threshold: 0.0218408405780792, right_val: 0.6090016961097717, left_val: 0.3370316028594971 }, { features: [[7, 15, 2, 4, -1.], [7, 17, 2, 2, 2.]], threshold: 2.4520049919374287e-004, right_val: 0.5987902283668518, left_val: 0.3500576019287109 }, { features: [[1, 0, 19, 9, -1.], [1, 3, 19, 3, 3.]], threshold: 8.3272606134414673e-003, right_val: 0.5697240829467773, left_val: 0.3267528116703033 }, { features: [[3, 7, 3, 6, -1.], [3, 9, 3, 2, 3.]], threshold: 5.7148298947140574e-004, right_val: 0.5531656742095947, left_val: 0.3044599890708923 }, { features: [[13, 7, 4, 4, -1.], [15, 7, 2, 2, 2.], [13, 9, 2, 2, 2.]], threshold: 6.7373987985774875e-004, right_val: 0.5672631263732910, left_val: 0.3650012016296387 }, { features: [[3, 7, 4, 4, -1.], [3, 7, 2, 2, 2.], [5, 9, 2, 2, 2.]], threshold: 3.4681590477703139e-005, right_val: 0.5388727188110352, left_val: 0.3313541114330292 }, { features: [[9, 6, 10, 8, -1.], [9, 10, 10, 4, 2.]], threshold: -5.8563398197293282e-003, right_val: 0.5498778820037842, left_val: 0.2697942852973938 }, { features: [[3, 8, 14, 12, -1.], [3, 14, 14, 6, 2.]], threshold: 8.5102273151278496e-003, right_val: 0.2762879133224487, left_val: 0.5269358158111572 }, { features: [[6, 5, 10, 12, -1.], [11, 5, 5, 6, 2.], [6, 11, 5, 6, 2.]], threshold: -0.0698172077536583, right_val: 0.5259246826171875, left_val: 0.2909603118896484 }, { features: [[9, 11, 2, 3, -1.], [9, 12, 2, 1, 3.]], threshold: -8.6113670840859413e-004, right_val: 0.4073697924613953, left_val: 0.5892577171325684 }, { features: [[9, 5, 6, 5, -1.], [9, 5, 3, 5, 2.]], threshold: 9.7149249631911516e-004, right_val: 0.5415862202644348, left_val: 0.3523564040660858 }, { features: [[9, 4, 2, 4, -1.], [9, 6, 2, 2, 2.]], threshold: -1.4727490452060010e-005, right_val: 0.3503156006336212, left_val: 0.5423017740249634 }, { features: [[9, 5, 6, 5, -1.], [9, 5, 3, 5, 2.]], threshold: 0.0484202913939953, right_val: 0.3411195874214172, left_val: 0.5193945765495300 }, { features: [[5, 5, 6, 5, -1.], [8, 5, 3, 5, 2.]], threshold: 1.3257140526548028e-003, right_val: 0.5335376262664795, left_val: 0.3157769143581390 }, { features: [[11, 2, 6, 1, -1.], [13, 2, 2, 1, 3.]], threshold: 1.4922149603080470e-005, right_val: 0.5536553859710693, left_val: 0.4451299905776978 }, { features: [[3, 2, 6, 1, -1.], [5, 2, 2, 1, 3.]], threshold: -2.7173398993909359e-003, right_val: 0.5248088836669922, left_val: 0.3031741976737976 }, { features: [[13, 5, 2, 3, -1.], [13, 6, 2, 1, 3.]], threshold: 2.9219500720500946e-003, right_val: 0.6606041789054871, left_val: 0.4781453013420105 }, { features: [[0, 10, 1, 4, -1.], [0, 12, 1, 2, 2.]], threshold: -1.9804988987743855e-003, right_val: 0.5287625193595886, left_val: 0.3186308145523071 }, { features: [[13, 5, 2, 3, -1.], [13, 6, 2, 1, 3.]], threshold: -4.0012109093368053e-003, right_val: 0.4749928116798401, left_val: 0.6413596868515015 }, { features: [[8, 18, 3, 2, -1.], [9, 18, 1, 2, 3.]], threshold: -4.3491991236805916e-003, right_val: 0.5098996758460999, left_val: 0.1507498025894165 }, { features: [[6, 15, 9, 2, -1.], [6, 16, 9, 1, 2.]], threshold: 1.3490889687091112e-003, right_val: 0.5881167054176331, left_val: 0.4316158890724182 }, { features: [[8, 14, 4, 3, -1.], [8, 15, 4, 1, 3.]], threshold: 0.0185970701277256, right_val: 0.9089794158935547, left_val: 0.4735553860664368 }, { features: [[18, 4, 2, 4, -1.], [18, 6, 2, 2, 2.]], threshold: -1.8562379991635680e-003, right_val: 0.5577837228775024, left_val: 0.3553189039230347 }, { features: [[5, 5, 2, 3, -1.], [5, 6, 2, 1, 3.]], threshold: 2.2940430790185928e-003, right_val: 0.6580877900123596, left_val: 0.4500094950199127 }, { features: [[15, 16, 3, 2, -1.], [15, 17, 3, 1, 2.]], threshold: 2.9982850537635386e-004, right_val: 0.3975878953933716, left_val: 0.5629242062568665 }, { features: [[0, 0, 3, 9, -1.], [0, 3, 3, 3, 3.]], threshold: 3.5455459728837013e-003, right_val: 0.3605485856533051, left_val: 0.5381547212600708 }, { features: [[9, 7, 3, 3, -1.], [9, 8, 3, 1, 3.]], threshold: 9.6104722470045090e-003, right_val: 0.1796745955944061, left_val: 0.5255997180938721 }, { features: [[8, 7, 3, 3, -1.], [8, 8, 3, 1, 3.]], threshold: -6.2783220782876015e-003, right_val: 0.5114030241966248, left_val: 0.2272856980562210 }, { features: [[9, 5, 2, 6, -1.], [9, 5, 1, 6, 2.]], threshold: 3.4598479978740215e-003, right_val: 0.6608219146728516, left_val: 0.4626308083534241 }, { features: [[8, 6, 3, 4, -1.], [9, 6, 1, 4, 3.]], threshold: -1.3112019514665008e-003, right_val: 0.4436857998371124, left_val: 0.6317539811134338 }, { features: [[7, 6, 8, 12, -1.], [11, 6, 4, 6, 2.], [7, 12, 4, 6, 2.]], threshold: 2.6876179035753012e-003, right_val: 0.4054022133350372, left_val: 0.5421109795570374 }, { features: [[5, 6, 8, 12, -1.], [5, 6, 4, 6, 2.], [9, 12, 4, 6, 2.]], threshold: 3.9118169806897640e-003, right_val: 0.3273454904556274, left_val: 0.5358477830886841 }, { features: [[12, 4, 3, 3, -1.], [12, 5, 3, 1, 3.]], threshold: -0.0142064504325390, right_val: 0.4975781142711639, left_val: 0.7793576717376709 }, { features: [[2, 16, 3, 2, -1.], [2, 17, 3, 1, 2.]], threshold: 7.1705528534948826e-004, right_val: 0.3560903966426849, left_val: 0.5297319889068604 }, { features: [[12, 4, 3, 3, -1.], [12, 5, 3, 1, 3.]], threshold: 1.6635019565001130e-003, right_val: 0.5816481709480286, left_val: 0.4678094089031220 }, { features: [[2, 12, 6, 6, -1.], [2, 14, 6, 2, 3.]], threshold: 3.3686188980937004e-003, right_val: 0.3446420133113861, left_val: 0.5276734232902527 }, { features: [[7, 13, 6, 3, -1.], [7, 14, 6, 1, 3.]], threshold: 0.0127995302900672, right_val: 0.7472159266471863, left_val: 0.4834679961204529 }, { features: [[6, 14, 6, 3, -1.], [6, 15, 6, 1, 3.]], threshold: 3.3901201095432043e-003, right_val: 0.6401721239089966, left_val: 0.4511859118938446 }, { features: [[14, 15, 5, 3, -1.], [14, 16, 5, 1, 3.]], threshold: 4.7070779837667942e-003, right_val: 0.3555220961570740, left_val: 0.5335658788681030 }, { features: [[5, 4, 3, 3, -1.], [5, 5, 3, 1, 3.]], threshold: 1.4819339849054813e-003, right_val: 0.5772724151611328, left_val: 0.4250707030296326 }, { features: [[14, 15, 5, 3, -1.], [14, 16, 5, 1, 3.]], threshold: -6.9995759986341000e-003, right_val: 0.5292900204658508, left_val: 0.3003320097923279 }, { features: [[5, 3, 6, 2, -1.], [7, 3, 2, 2, 3.]], threshold: 0.0159390103071928, right_val: 0.1675581932067871, left_val: 0.5067319273948669 }, { features: [[8, 15, 4, 3, -1.], [8, 16, 4, 1, 3.]], threshold: 7.6377349905669689e-003, right_val: 0.7085601091384888, left_val: 0.4795069992542267 }, { features: [[1, 15, 5, 3, -1.], [1, 16, 5, 1, 3.]], threshold: 6.7334040068089962e-003, right_val: 0.2162470072507858, left_val: 0.5133113265037537 }, { features: [[8, 13, 4, 6, -1.], [10, 13, 2, 3, 2.], [8, 16, 2, 3, 2.]], threshold: -0.0128588099032640, right_val: 0.5251371860504150, left_val: 0.1938841938972473 }, { features: [[7, 8, 3, 3, -1.], [8, 8, 1, 3, 3.]], threshold: -6.2270800117403269e-004, right_val: 0.4197868108749390, left_val: 0.5686538219451904 }, { features: [[12, 0, 5, 4, -1.], [12, 2, 5, 2, 2.]], threshold: -5.2651681471616030e-004, right_val: 0.5429695844650269, left_val: 0.4224168956279755 }, { features: [[0, 2, 20, 2, -1.], [0, 2, 10, 1, 2.], [10, 3, 10, 1, 2.]], threshold: 0.0110750999301672, right_val: 0.2514517903327942, left_val: 0.5113775134086609 }, { features: [[1, 0, 18, 4, -1.], [7, 0, 6, 4, 3.]], threshold: -0.0367282517254353, right_val: 0.4849618971347809, left_val: 0.7194662094116211 }, { features: [[4, 3, 6, 1, -1.], [6, 3, 2, 1, 3.]], threshold: -2.8207109426148236e-004, right_val: 0.5394446253776550, left_val: 0.3840261995792389 }, { features: [[4, 18, 13, 2, -1.], [4, 19, 13, 1, 2.]], threshold: -2.7489690110087395e-003, right_val: 0.4569182097911835, left_val: 0.5937088727951050 }, { features: [[2, 10, 3, 6, -1.], [2, 12, 3, 2, 3.]], threshold: 0.0100475195795298, right_val: 0.2802298069000244, left_val: 0.5138576030731201 }, { features: [[14, 12, 6, 8, -1.], [17, 12, 3, 4, 2.], [14, 16, 3, 4, 2.]], threshold: -8.1497840583324432e-003, right_val: 0.4636121094226837, left_val: 0.6090037226676941 }, { features: [[4, 13, 10, 6, -1.], [4, 13, 5, 3, 2.], [9, 16, 5, 3, 2.]], threshold: -6.8833888508379459e-003, right_val: 0.5254660248756409, left_val: 0.3458611071109772 }, { features: [[14, 12, 1, 2, -1.], [14, 13, 1, 1, 2.]], threshold: -1.4039360394235700e-005, right_val: 0.4082083106040955, left_val: 0.5693104267120361 }, { features: [[8, 13, 4, 3, -1.], [8, 14, 4, 1, 3.]], threshold: 1.5498419525101781e-003, right_val: 0.5806517004966736, left_val: 0.4350537061691284 }, { features: [[14, 12, 2, 2, -1.], [14, 13, 2, 1, 2.]], threshold: -6.7841499112546444e-003, right_val: 0.5182775259017944, left_val: 0.1468873023986816 }, { features: [[4, 12, 2, 2, -1.], [4, 13, 2, 1, 2.]], threshold: 2.1705629478674382e-004, right_val: 0.3456174135208130, left_val: 0.5293524265289307 }, { features: [[8, 12, 9, 2, -1.], [8, 13, 9, 1, 2.]], threshold: 3.1198898795992136e-004, right_val: 0.5942413806915283, left_val: 0.4652450978755951 }, { features: [[9, 14, 2, 3, -1.], [9, 15, 2, 1, 3.]], threshold: 5.4507530294358730e-003, right_val: 0.7024846076965332, left_val: 0.4653508961200714 }, { features: [[11, 10, 3, 6, -1.], [11, 13, 3, 3, 2.]], threshold: -2.5818689027801156e-004, right_val: 0.3768967092037201, left_val: 0.5497295260429382 }, { features: [[5, 6, 9, 12, -1.], [5, 12, 9, 6, 2.]], threshold: -0.0174425393342972, right_val: 0.5457497835159302, left_val: 0.3919087946414948 }, { features: [[11, 10, 3, 6, -1.], [11, 13, 3, 3, 2.]], threshold: -0.0453435294330120, right_val: 0.5154908895492554, left_val: 0.1631357073783875 }, { features: [[6, 10, 3, 6, -1.], [6, 13, 3, 3, 2.]], threshold: 1.9190689781680703e-003, right_val: 0.2791895866394043, left_val: 0.5145897865295410 }, { features: [[5, 4, 11, 3, -1.], [5, 5, 11, 1, 3.]], threshold: -6.0177869163453579e-003, right_val: 0.4756332933902741, left_val: 0.6517636179924011 }, { features: [[7, 1, 5, 10, -1.], [7, 6, 5, 5, 2.]], threshold: -4.0720738470554352e-003, right_val: 0.4092685878276825, left_val: 0.5514652729034424 }, { features: [[2, 8, 18, 2, -1.], [2, 9, 18, 1, 2.]], threshold: 3.9855059003457427e-004, right_val: 0.5285550951957703, left_val: 0.3165240883827210 }, { features: [[7, 17, 5, 3, -1.], [7, 18, 5, 1, 3.]], threshold: -6.5418570302426815e-003, right_val: 0.4652808904647827, left_val: 0.6853377819061279 }, { features: [[5, 9, 12, 1, -1.], [9, 9, 4, 1, 3.]], threshold: 3.4845089539885521e-003, right_val: 0.4502759873867035, left_val: 0.5484588146209717 }, { features: [[0, 14, 6, 6, -1.], [0, 14, 3, 3, 2.], [3, 17, 3, 3, 2.]], threshold: -0.0136967804282904, right_val: 0.4572555124759674, left_val: 0.6395779848098755 }, { features: [[5, 9, 12, 1, -1.], [9, 9, 4, 1, 3.]], threshold: -0.0173471402376890, right_val: 0.5181614756584168, left_val: 0.2751072943210602 }, { features: [[3, 9, 12, 1, -1.], [7, 9, 4, 1, 3.]], threshold: -4.0885428898036480e-003, right_val: 0.5194984078407288, left_val: 0.3325636088848114 }, { features: [[14, 10, 6, 7, -1.], [14, 10, 3, 7, 2.]], threshold: -9.4687901437282562e-003, right_val: 0.4851819872856140, left_val: 0.5942280888557434 }, { features: [[1, 0, 16, 2, -1.], [1, 1, 16, 1, 2.]], threshold: 1.7084840219467878e-003, right_val: 0.5519806146621704, left_val: 0.4167110919952393 }, { features: [[10, 9, 10, 9, -1.], [10, 12, 10, 3, 3.]], threshold: 9.4809094443917274e-003, right_val: 0.4208514988422394, left_val: 0.5433894991874695 }, { features: [[0, 1, 10, 2, -1.], [5, 1, 5, 2, 2.]], threshold: -4.7389650717377663e-003, right_val: 0.4560655057430267, left_val: 0.6407189965248108 }, { features: [[17, 3, 2, 3, -1.], [17, 4, 2, 1, 3.]], threshold: 6.5761050209403038e-003, right_val: 0.2258227020502091, left_val: 0.5214555263519287 }, { features: [[1, 3, 2, 3, -1.], [1, 4, 2, 1, 3.]], threshold: -2.1690549328923225e-003, right_val: 0.5156704783439636, left_val: 0.3151527941226959 }, { features: [[9, 7, 3, 6, -1.], [10, 7, 1, 6, 3.]], threshold: 0.0146601703017950, right_val: 0.6689941287040710, left_val: 0.4870837032794952 }, { features: [[6, 5, 4, 3, -1.], [8, 5, 2, 3, 2.]], threshold: 1.7231999663636088e-004, right_val: 0.5251078009605408, left_val: 0.3569748997688294 }, { features: [[7, 5, 6, 6, -1.], [9, 5, 2, 6, 3.]], threshold: -0.0218037609010935, right_val: 0.4966329932212830, left_val: 0.8825920820236206 }, { features: [[3, 4, 12, 12, -1.], [3, 4, 6, 6, 2.], [9, 10, 6, 6, 2.]], threshold: -0.0947361066937447, right_val: 0.5061113834381104, left_val: 0.1446162015199661 }, { features: [[9, 2, 6, 15, -1.], [11, 2, 2, 15, 3.]], threshold: 5.5825551971793175e-003, right_val: 0.4238066077232361, left_val: 0.5396478772163391 }, { features: [[2, 2, 6, 17, -1.], [4, 2, 2, 17, 3.]], threshold: 1.9517090404406190e-003, right_val: 0.5497786998748779, left_val: 0.4170410931110382 }, { features: [[14, 10, 6, 7, -1.], [14, 10, 3, 7, 2.]], threshold: 0.0121499001979828, right_val: 0.5664274096488953, left_val: 0.4698367118835449 }, { features: [[0, 10, 6, 7, -1.], [3, 10, 3, 7, 2.]], threshold: -7.5169620104134083e-003, right_val: 0.4463135898113251, left_val: 0.6267772912979126 }, { features: [[9, 2, 6, 15, -1.], [11, 2, 2, 15, 3.]], threshold: -0.0716679096221924, right_val: 0.5221003293991089, left_val: 0.3097011148929596 }, { features: [[5, 2, 6, 15, -1.], [7, 2, 2, 15, 3.]], threshold: -0.0882924199104309, right_val: 0.5006365180015564, left_val: 0.0811238884925842 }, { features: [[17, 9, 3, 6, -1.], [17, 11, 3, 2, 3.]], threshold: 0.0310630798339844, right_val: 0.1282255947589874, left_val: 0.5155503749847412 }, { features: [[6, 7, 6, 6, -1.], [8, 7, 2, 6, 3.]], threshold: 0.0466218404471874, right_val: 0.7363960742950440, left_val: 0.4699777960777283 }, { features: [[1, 10, 18, 6, -1.], [10, 10, 9, 3, 2.], [1, 13, 9, 3, 2.]], threshold: -0.0121894897893071, right_val: 0.5518996715545654, left_val: 0.3920530080795288 }, { features: [[0, 9, 10, 9, -1.], [0, 12, 10, 3, 3.]], threshold: 0.0130161102861166, right_val: 0.3685136139392853, left_val: 0.5260658264160156 }, { features: [[8, 15, 4, 3, -1.], [8, 16, 4, 1, 3.]], threshold: -3.4952899441123009e-003, right_val: 0.4716280996799469, left_val: 0.6339294910430908 }, { features: [[5, 12, 3, 4, -1.], [5, 14, 3, 2, 2.]], threshold: -4.4015039748046547e-005, right_val: 0.3776184916496277, left_val: 0.5333027243614197 }, { features: [[3, 3, 16, 12, -1.], [3, 9, 16, 6, 2.]], threshold: -0.1096649020910263, right_val: 0.5198346972465515, left_val: 0.1765342056751251 }, { features: [[1, 1, 12, 12, -1.], [1, 1, 6, 6, 2.], [7, 7, 6, 6, 2.]], threshold: -9.0279558207839727e-004, right_val: 0.3838908076286316, left_val: 0.5324159860610962 }, { features: [[10, 4, 2, 4, -1.], [11, 4, 1, 2, 2.], [10, 6, 1, 2, 2.]], threshold: 7.1126641705632210e-004, right_val: 0.5755224227905273, left_val: 0.4647929966449738 }, { features: [[0, 9, 10, 2, -1.], [0, 9, 5, 1, 2.], [5, 10, 5, 1, 2.]], threshold: -3.1250279862433672e-003, right_val: 0.5166770815849304, left_val: 0.3236708939075470 }, { features: [[9, 11, 3, 3, -1.], [9, 12, 3, 1, 3.]], threshold: 2.4144679773598909e-003, right_val: 0.6459717750549316, left_val: 0.4787439107894898 }, { features: [[3, 12, 9, 2, -1.], [3, 13, 9, 1, 2.]], threshold: 4.4391240226104856e-004, right_val: 0.6010255813598633, left_val: 0.4409308135509491 }, { features: [[9, 9, 2, 2, -1.], [9, 10, 2, 1, 2.]], threshold: -2.2611189342569560e-004, right_val: 0.5493255853652954, left_val: 0.4038113951683044 }], threshold: 50.1697311401367190 }, { simpleClassifiers: [{ features: [[3, 4, 13, 6, -1.], [3, 6, 13, 2, 3.]], threshold: -0.0469012893736362, right_val: 0.3743801116943359, left_val: 0.6600171923637390 }, { features: [[9, 7, 6, 4, -1.], [12, 7, 3, 2, 2.], [9, 9, 3, 2, 2.]], threshold: -1.4568349579349160e-003, right_val: 0.3437797129154205, left_val: 0.5783991217613220 }, { features: [[1, 0, 6, 8, -1.], [4, 0, 3, 8, 2.]], threshold: 5.5598369799554348e-003, right_val: 0.5908216238021851, left_val: 0.3622266948223114 }, { features: [[9, 5, 2, 12, -1.], [9, 11, 2, 6, 2.]], threshold: 7.3170487303286791e-004, right_val: 0.2873558104038239, left_val: 0.5500419139862061 }, { features: [[4, 4, 3, 10, -1.], [4, 9, 3, 5, 2.]], threshold: 1.3318009441718459e-003, right_val: 0.5431019067764282, left_val: 0.2673169970512390 }, { features: [[6, 17, 8, 3, -1.], [6, 18, 8, 1, 3.]], threshold: 2.4347059661522508e-004, right_val: 0.5741388797760010, left_val: 0.3855027854442596 }, { features: [[0, 5, 10, 6, -1.], [0, 7, 10, 2, 3.]], threshold: -3.0512469820678234e-003, right_val: 0.3462845087051392, left_val: 0.5503209829330444 }, { features: [[13, 2, 3, 2, -1.], [13, 3, 3, 1, 2.]], threshold: -6.8657199153676629e-004, right_val: 0.5429509282112122, left_val: 0.3291221857070923 }, { features: [[7, 5, 4, 5, -1.], [9, 5, 2, 5, 2.]], threshold: 1.4668200165033340e-003, right_val: 0.5351811051368713, left_val: 0.3588382005691528 }, { features: [[12, 14, 3, 6, -1.], [12, 16, 3, 2, 3.]], threshold: 3.2021870720200241e-004, right_val: 0.5700234174728394, left_val: 0.4296841919422150 }, { features: [[1, 11, 8, 2, -1.], [1, 12, 8, 1, 2.]], threshold: 7.4122188379988074e-004, right_val: 0.3366870880126953, left_val: 0.5282164812088013 }, { features: [[7, 13, 6, 3, -1.], [7, 14, 6, 1, 3.]], threshold: 3.8330298848450184e-003, right_val: 0.6257336139678955, left_val: 0.4559567868709564 }, { features: [[0, 5, 3, 6, -1.], [0, 7, 3, 2, 3.]], threshold: -0.0154564399272203, right_val: 0.5129452943801880, left_val: 0.2350116968154907 }, { features: [[13, 2, 3, 2, -1.], [13, 3, 3, 1, 2.]], threshold: 2.6796779129654169e-003, right_val: 0.4155062139034271, left_val: 0.5329415202140808 }, { features: [[4, 14, 4, 6, -1.], [4, 14, 2, 3, 2.], [6, 17, 2, 3, 2.]], threshold: 2.8296569362282753e-003, right_val: 0.5804538130760193, left_val: 0.4273087978363037 }, { features: [[13, 2, 3, 2, -1.], [13, 3, 3, 1, 2.]], threshold: -3.9444249123334885e-003, right_val: 0.5202686190605164, left_val: 0.2912611961364746 }, { features: [[8, 2, 4, 12, -1.], [8, 6, 4, 4, 3.]], threshold: 2.7179559692740440e-003, right_val: 0.3585677146911621, left_val: 0.5307688117027283 }, { features: [[14, 0, 6, 8, -1.], [17, 0, 3, 4, 2.], [14, 4, 3, 4, 2.]], threshold: 5.9077627956867218e-003, right_val: 0.5941585898399353, left_val: 0.4703775048255920 }, { features: [[7, 17, 3, 2, -1.], [8, 17, 1, 2, 3.]], threshold: -4.2240349575877190e-003, right_val: 0.5088796019554138, left_val: 0.2141567021608353 }, { features: [[8, 12, 4, 2, -1.], [8, 13, 4, 1, 2.]], threshold: 4.0725888684391975e-003, right_val: 0.6841061115264893, left_val: 0.4766413867473602 }, { features: [[6, 0, 8, 12, -1.], [6, 0, 4, 6, 2.], [10, 6, 4, 6, 2.]], threshold: 0.0101495301350951, right_val: 0.3748497068881989, left_val: 0.5360798835754395 }, { features: [[14, 0, 2, 10, -1.], [15, 0, 1, 5, 2.], [14, 5, 1, 5, 2.]], threshold: -1.8864999583456665e-004, right_val: 0.3853805065155029, left_val: 0.5720130205154419 }, { features: [[5, 3, 8, 6, -1.], [5, 3, 4, 3, 2.], [9, 6, 4, 3, 2.]], threshold: -4.8864358104765415e-003, right_val: 0.5340958833694458, left_val: 0.3693122863769531 }, { features: [[14, 0, 6, 10, -1.], [17, 0, 3, 5, 2.], [14, 5, 3, 5, 2.]], threshold: 0.0261584799736738, right_val: 0.6059989929199219, left_val: 0.4962374866008759 }, { features: [[9, 14, 1, 2, -1.], [9, 15, 1, 1, 2.]], threshold: 4.8560759751126170e-004, right_val: 0.6012468934059143, left_val: 0.4438945949077606 }, { features: [[15, 10, 4, 3, -1.], [15, 11, 4, 1, 3.]], threshold: 0.0112687097862363, right_val: 0.1840388029813767, left_val: 0.5244250297546387 }, { features: [[8, 14, 2, 3, -1.], [8, 15, 2, 1, 3.]], threshold: -2.8114619199186563e-003, right_val: 0.4409897029399872, left_val: 0.6060283780097961 }, { features: [[3, 13, 14, 4, -1.], [10, 13, 7, 2, 2.], [3, 15, 7, 2, 2.]], threshold: -5.6112729944288731e-003, right_val: 0.5589237213134766, left_val: 0.3891170918941498 }, { features: [[1, 10, 4, 3, -1.], [1, 11, 4, 1, 3.]], threshold: 8.5680093616247177e-003, right_val: 0.2062619030475617, left_val: 0.5069345831871033 }, { features: [[9, 11, 6, 1, -1.], [11, 11, 2, 1, 3.]], threshold: -3.8172779022715986e-004, right_val: 0.4192610979080200, left_val: 0.5882201790809631 }, { features: [[5, 11, 6, 1, -1.], [7, 11, 2, 1, 3.]], threshold: -1.7680290329735726e-004, right_val: 0.4003368914127350, left_val: 0.5533605813980103 }, { features: [[3, 5, 16, 15, -1.], [3, 10, 16, 5, 3.]], threshold: 6.5112537704408169e-003, right_val: 0.5444191098213196, left_val: 0.3310146927833557 }, { features: [[6, 12, 4, 2, -1.], [8, 12, 2, 2, 2.]], threshold: -6.5948683186434209e-005, right_val: 0.3944905996322632, left_val: 0.5433831810951233 }, { features: [[4, 4, 12, 10, -1.], [10, 4, 6, 5, 2.], [4, 9, 6, 5, 2.]], threshold: 6.9939051754772663e-003, right_val: 0.4192714095115662, left_val: 0.5600358247756958 }, { features: [[8, 6, 3, 4, -1.], [9, 6, 1, 4, 3.]], threshold: -4.6744439750909805e-003, right_val: 0.4604960978031158, left_val: 0.6685466766357422 }, { features: [[8, 12, 4, 8, -1.], [10, 12, 2, 4, 2.], [8, 16, 2, 4, 2.]], threshold: 0.0115898502990603, right_val: 0.2926830053329468, left_val: 0.5357121229171753 }, { features: [[8, 14, 4, 3, -1.], [8, 15, 4, 1, 3.]], threshold: 0.0130078401416540, right_val: 0.7307463288307190, left_val: 0.4679817855358124 }, { features: [[12, 2, 3, 2, -1.], [13, 2, 1, 2, 3.]], threshold: -1.1008579749614000e-003, right_val: 0.5415065288543701, left_val: 0.3937501013278961 }, { features: [[8, 15, 3, 2, -1.], [8, 16, 3, 1, 2.]], threshold: 6.0472649056464434e-004, right_val: 0.5604041218757629, left_val: 0.4242376089096069 }, { features: [[6, 0, 9, 14, -1.], [9, 0, 3, 14, 3.]], threshold: -0.0144948400557041, right_val: 0.5293182730674744, left_val: 0.3631210029125214 }, { features: [[9, 6, 2, 3, -1.], [10, 6, 1, 3, 2.]], threshold: -5.3056948818266392e-003, right_val: 0.4621821045875549, left_val: 0.6860452294349670 }, { features: [[10, 8, 2, 3, -1.], [10, 9, 2, 1, 3.]], threshold: -8.1829127157106996e-004, right_val: 0.5420439243316650, left_val: 0.3944096863269806 }, { features: [[0, 9, 4, 6, -1.], [0, 11, 4, 2, 3.]], threshold: -0.0190775208175182, right_val: 0.5037891864776611, left_val: 0.1962621957063675 }, { features: [[6, 0, 8, 2, -1.], [6, 1, 8, 1, 2.]], threshold: 3.5549470339901745e-004, right_val: 0.5613973140716553, left_val: 0.4086259007453919 }, { features: [[6, 14, 7, 3, -1.], [6, 15, 7, 1, 3.]], threshold: 1.9679730758070946e-003, right_val: 0.5926123261451721, left_val: 0.4489121139049530 }, { features: [[8, 10, 8, 9, -1.], [8, 13, 8, 3, 3.]], threshold: 6.9189141504466534e-003, right_val: 0.3728385865688324, left_val: 0.5335925817489624 }, { features: [[5, 2, 3, 2, -1.], [6, 2, 1, 2, 3.]], threshold: 2.9872779268771410e-003, right_val: 0.2975643873214722, left_val: 0.5111321210861206 }, { features: [[14, 1, 6, 8, -1.], [17, 1, 3, 4, 2.], [14, 5, 3, 4, 2.]], threshold: -6.2264618463814259e-003, right_val: 0.4824537932872772, left_val: 0.5541489720344544 }, { features: [[0, 1, 6, 8, -1.], [0, 1, 3, 4, 2.], [3, 5, 3, 4, 2.]], threshold: 0.0133533002808690, right_val: 0.6414797902107239, left_val: 0.4586423933506012 }, { features: [[1, 2, 18, 6, -1.], [10, 2, 9, 3, 2.], [1, 5, 9, 3, 2.]], threshold: 0.0335052385926247, right_val: 0.3429994881153107, left_val: 0.5392425060272217 }, { features: [[9, 3, 2, 1, -1.], [10, 3, 1, 1, 2.]], threshold: -2.5294460356235504e-003, right_val: 0.5013315081596375, left_val: 0.1703713983297348 }, { features: [[13, 2, 4, 6, -1.], [15, 2, 2, 3, 2.], [13, 5, 2, 3, 2.]], threshold: -1.2801629491150379e-003, right_val: 0.4697405099868774, left_val: 0.5305461883544922 }, { features: [[5, 4, 3, 3, -1.], [5, 5, 3, 1, 3.]], threshold: 7.0687388069927692e-003, right_val: 0.6436504721641541, left_val: 0.4615545868873596 }, { features: [[13, 5, 1, 3, -1.], [13, 6, 1, 1, 3.]], threshold: 9.6880499040707946e-004, right_val: 0.6043894290924072, left_val: 0.4833599030971527 }, { features: [[2, 16, 5, 3, -1.], [2, 17, 5, 1, 3.]], threshold: 3.9647659286856651e-003, right_val: 0.3231816887855530, left_val: 0.5187637209892273 }, { features: [[13, 2, 4, 6, -1.], [15, 2, 2, 3, 2.], [13, 5, 2, 3, 2.]], threshold: -0.0220577307045460, right_val: 0.5200980901718140, left_val: 0.4079256951808929 }, { features: [[3, 2, 4, 6, -1.], [3, 2, 2, 3, 2.], [5, 5, 2, 3, 2.]], threshold: -6.6906312713399529e-004, right_val: 0.3815600872039795, left_val: 0.5331609249114990 }, { features: [[13, 5, 1, 2, -1.], [13, 6, 1, 1, 2.]], threshold: -6.7009328631684184e-004, right_val: 0.4688901901245117, left_val: 0.5655422210693359 }, { features: [[5, 5, 2, 2, -1.], [5, 6, 2, 1, 2.]], threshold: 7.4284552829340100e-004, right_val: 0.6287400126457214, left_val: 0.4534381031990051 }, { features: [[13, 9, 2, 2, -1.], [13, 9, 1, 2, 2.]], threshold: 2.2227810695767403e-003, right_val: 0.3303655982017517, left_val: 0.5350633263587952 }, { features: [[5, 9, 2, 2, -1.], [6, 9, 1, 2, 2.]], threshold: -5.4130521602928638e-003, right_val: 0.5005434751510620, left_val: 0.1113687008619309 }, { features: [[13, 17, 3, 2, -1.], [13, 18, 3, 1, 2.]], threshold: -1.4520040167553816e-005, right_val: 0.4325133860111237, left_val: 0.5628737807273865 }, { features: [[6, 16, 4, 4, -1.], [6, 16, 2, 2, 2.], [8, 18, 2, 2, 2.]], threshold: 2.3369169502984732e-004, right_val: 0.5447791218757629, left_val: 0.4165835082530975 }, { features: [[9, 16, 2, 3, -1.], [9, 17, 2, 1, 3.]], threshold: 4.2894547805190086e-003, right_val: 0.6778649091720581, left_val: 0.4860391020774841 }, { features: [[0, 13, 9, 6, -1.], [0, 15, 9, 2, 3.]], threshold: 5.9103150852024555e-003, right_val: 0.3612113893032074, left_val: 0.5262305140495300 }, { features: [[9, 14, 2, 6, -1.], [9, 17, 2, 3, 2.]], threshold: 0.0129005396738648, right_val: 0.3250288069248200, left_val: 0.5319377183914185 }, { features: [[9, 15, 2, 3, -1.], [9, 16, 2, 1, 3.]], threshold: 4.6982979401946068e-003, right_val: 0.6665925979614258, left_val: 0.4618245065212250 }, { features: [[1, 10, 18, 6, -1.], [1, 12, 18, 2, 3.]], threshold: 0.0104398597031832, right_val: 0.3883604109287262, left_val: 0.5505670905113220 }, { features: [[8, 11, 4, 2, -1.], [8, 12, 4, 1, 2.]], threshold: 3.0443191062659025e-003, right_val: 0.7301844954490662, left_val: 0.4697853028774262 }, { features: [[7, 9, 6, 2, -1.], [7, 10, 6, 1, 2.]], threshold: -6.1593751888722181e-004, right_val: 0.5464984178543091, left_val: 0.3830839097499847 }, { features: [[8, 8, 2, 3, -1.], [8, 9, 2, 1, 3.]], threshold: -3.4247159492224455e-003, right_val: 0.5089530944824219, left_val: 0.2566300034523010 }, { features: [[17, 5, 3, 4, -1.], [18, 5, 1, 4, 3.]], threshold: -9.3538565561175346e-003, right_val: 0.4940795898437500, left_val: 0.6469966173171997 }, { features: [[1, 19, 18, 1, -1.], [7, 19, 6, 1, 3.]], threshold: 0.0523389987647533, right_val: 0.7878770828247070, left_val: 0.4745982885360718 }, { features: [[9, 0, 3, 2, -1.], [10, 0, 1, 2, 3.]], threshold: 3.5765620414167643e-003, right_val: 0.2748498022556305, left_val: 0.5306664705276489 }, { features: [[1, 8, 1, 6, -1.], [1, 10, 1, 2, 3.]], threshold: 7.1555317845195532e-004, right_val: 0.4041908979415894, left_val: 0.5413125753402710 }, { features: [[12, 17, 8, 3, -1.], [12, 17, 4, 3, 2.]], threshold: -0.0105166798457503, right_val: 0.4815283119678497, left_val: 0.6158512234687805 }, { features: [[0, 5, 3, 4, -1.], [1, 5, 1, 4, 3.]], threshold: 7.7347927726805210e-003, right_val: 0.7028980851173401, left_val: 0.4695805907249451 }, { features: [[9, 7, 2, 3, -1.], [9, 8, 2, 1, 3.]], threshold: -4.3226778507232666e-003, right_val: 0.5304684042930603, left_val: 0.2849566042423248 }, { features: [[7, 11, 2, 2, -1.], [7, 11, 1, 1, 2.], [8, 12, 1, 1, 2.]], threshold: -2.5534399319440126e-003, right_val: 0.4688892066478729, left_val: 0.7056984901428223 }, { features: [[11, 3, 2, 5, -1.], [11, 3, 1, 5, 2.]], threshold: 1.0268510231981054e-004, right_val: 0.5573464035987854, left_val: 0.3902932107448578 }, { features: [[7, 3, 2, 5, -1.], [8, 3, 1, 5, 2.]], threshold: 7.1395188570022583e-006, right_val: 0.5263987779617310, left_val: 0.3684231936931610 }, { features: [[15, 13, 2, 3, -1.], [15, 14, 2, 1, 3.]], threshold: -1.6711989883333445e-003, right_val: 0.5387271046638489, left_val: 0.3849175870418549 }, { features: [[5, 6, 2, 3, -1.], [5, 7, 2, 1, 3.]], threshold: 4.9260449595749378e-003, right_val: 0.7447251081466675, left_val: 0.4729771912097931 }, { features: [[4, 19, 15, 1, -1.], [9, 19, 5, 1, 3.]], threshold: 4.3908702209591866e-003, right_val: 0.5591921806335449, left_val: 0.4809181094169617 }, { features: [[1, 19, 15, 1, -1.], [6, 19, 5, 1, 3.]], threshold: -0.0177936293184757, right_val: 0.4676927030086517, left_val: 0.6903678178787231 }, { features: [[15, 13, 2, 3, -1.], [15, 14, 2, 1, 3.]], threshold: 2.0469669252634048e-003, right_val: 0.3308162093162537, left_val: 0.5370690226554871 }, { features: [[5, 0, 4, 15, -1.], [7, 0, 2, 15, 2.]], threshold: 0.0298914890736341, right_val: 0.3309059143066406, left_val: 0.5139865279197693 }, { features: [[9, 6, 2, 5, -1.], [9, 6, 1, 5, 2.]], threshold: 1.5494900289922953e-003, right_val: 0.6078342795372009, left_val: 0.4660237133502960 }, { features: [[9, 5, 2, 7, -1.], [10, 5, 1, 7, 2.]], threshold: 1.4956969534978271e-003, right_val: 0.5863919854164124, left_val: 0.4404835999011993 }, { features: [[16, 11, 3, 3, -1.], [16, 12, 3, 1, 3.]], threshold: 9.5885928021743894e-004, right_val: 0.4208523035049439, left_val: 0.5435971021652222 }, { features: [[1, 11, 3, 3, -1.], [1, 12, 3, 1, 3.]], threshold: 4.9643701640889049e-004, right_val: 0.4000622034072876, left_val: 0.5370578169822693 }, { features: [[6, 6, 8, 3, -1.], [6, 7, 8, 1, 3.]], threshold: -2.7280810754746199e-003, right_val: 0.4259642958641052, left_val: 0.5659412741661072 }, { features: [[0, 15, 6, 2, -1.], [0, 16, 6, 1, 2.]], threshold: 2.3026480339467525e-003, right_val: 0.3350869119167328, left_val: 0.5161657929420471 }, { features: [[1, 0, 18, 6, -1.], [7, 0, 6, 6, 3.]], threshold: 0.2515163123607636, right_val: 0.7147309780120850, left_val: 0.4869661927223206 }, { features: [[6, 0, 3, 4, -1.], [7, 0, 1, 4, 3.]], threshold: -4.6328022144734859e-003, right_val: 0.5083789825439453, left_val: 0.2727448940277100 }, { features: [[14, 10, 4, 10, -1.], [16, 10, 2, 5, 2.], [14, 15, 2, 5, 2.]], threshold: -0.0404344908893108, right_val: 0.5021767020225525, left_val: 0.6851438879966736 }, { features: [[3, 2, 3, 2, -1.], [4, 2, 1, 2, 3.]], threshold: 1.4972220014897175e-005, right_val: 0.5522555112838745, left_val: 0.4284465014934540 }, { features: [[11, 2, 2, 2, -1.], [11, 3, 2, 1, 2.]], threshold: -2.4050309730228037e-004, right_val: 0.5390074849128723, left_val: 0.4226118922233582 }, { features: [[2, 10, 4, 10, -1.], [2, 10, 2, 5, 2.], [4, 15, 2, 5, 2.]], threshold: 0.0236578397452831, right_val: 0.7504366040229797, left_val: 0.4744631946086884 }, { features: [[0, 13, 20, 6, -1.], [10, 13, 10, 3, 2.], [0, 16, 10, 3, 2.]], threshold: -8.1449104472994804e-003, right_val: 0.5538362860679627, left_val: 0.4245058894157410 }, { features: [[0, 5, 2, 15, -1.], [1, 5, 1, 15, 2.]], threshold: -3.6992130335420370e-003, right_val: 0.4529713094234467, left_val: 0.5952357053756714 }, { features: [[1, 7, 18, 4, -1.], [10, 7, 9, 2, 2.], [1, 9, 9, 2, 2.]], threshold: -6.7718601785600185e-003, right_val: 0.5473399758338928, left_val: 0.4137794077396393 }, { features: [[0, 0, 2, 17, -1.], [1, 0, 1, 17, 2.]], threshold: 4.2669530957937241e-003, right_val: 0.5797994136810303, left_val: 0.4484114944934845 }, { features: [[2, 6, 16, 6, -1.], [10, 6, 8, 3, 2.], [2, 9, 8, 3, 2.]], threshold: 1.7791989957913756e-003, right_val: 0.4432444870471954, left_val: 0.5624858736991882 }, { features: [[8, 14, 1, 3, -1.], [8, 15, 1, 1, 3.]], threshold: 1.6774770338088274e-003, right_val: 0.6364241838455200, left_val: 0.4637751877307892 }, { features: [[8, 15, 4, 2, -1.], [8, 16, 4, 1, 2.]], threshold: 1.1732629500329494e-003, right_val: 0.5914415717124939, left_val: 0.4544503092765808 }, { features: [[5, 2, 8, 2, -1.], [5, 2, 4, 1, 2.], [9, 3, 4, 1, 2.]], threshold: 8.6998171173036098e-004, right_val: 0.3885917961597443, left_val: 0.5334752798080444 }, { features: [[6, 11, 8, 6, -1.], [6, 14, 8, 3, 2.]], threshold: 7.6378340600058436e-004, right_val: 0.3744941949844360, left_val: 0.5398585200309753 }, { features: [[9, 13, 2, 2, -1.], [9, 14, 2, 1, 2.]], threshold: 1.5684569370932877e-004, right_val: 0.5614616274833679, left_val: 0.4317873120307922 }, { features: [[18, 4, 2, 6, -1.], [18, 6, 2, 2, 3.]], threshold: -0.0215113703161478, right_val: 0.5185542702674866, left_val: 0.1785925030708313 }, { features: [[9, 12, 2, 2, -1.], [9, 13, 2, 1, 2.]], threshold: 1.3081369979772717e-004, right_val: 0.5682849884033203, left_val: 0.4342499077320099 }, { features: [[18, 4, 2, 6, -1.], [18, 6, 2, 2, 3.]], threshold: 0.0219920407980680, right_val: 0.2379394024610519, left_val: 0.5161716938018799 }, { features: [[9, 13, 1, 3, -1.], [9, 14, 1, 1, 3.]], threshold: -8.0136500764638186e-004, right_val: 0.4466426968574524, left_val: 0.5986763238906860 }, { features: [[18, 4, 2, 6, -1.], [18, 6, 2, 2, 3.]], threshold: -8.2736099138855934e-003, right_val: 0.5251057147979736, left_val: 0.4108217954635620 }, { features: [[0, 4, 2, 6, -1.], [0, 6, 2, 2, 3.]], threshold: 3.6831789184361696e-003, right_val: 0.3397518098354340, left_val: 0.5173814296722412 }, { features: [[9, 12, 3, 3, -1.], [9, 13, 3, 1, 3.]], threshold: -7.9525681212544441e-003, right_val: 0.4845924079418182, left_val: 0.6888983249664307 }, { features: [[3, 13, 2, 3, -1.], [3, 14, 2, 1, 3.]], threshold: 1.5382299898192286e-003, right_val: 0.3454113900661469, left_val: 0.5178567171096802 }, { features: [[13, 13, 4, 3, -1.], [13, 14, 4, 1, 3.]], threshold: -0.0140435304492712, right_val: 0.5188667774200440, left_val: 0.1678421050310135 }, { features: [[5, 4, 3, 3, -1.], [5, 5, 3, 1, 3.]], threshold: 1.4315890148282051e-003, right_val: 0.5655773878097534, left_val: 0.4368256926536560 }, { features: [[5, 2, 10, 6, -1.], [5, 4, 10, 2, 3.]], threshold: -0.0340142287313938, right_val: 0.4959217011928558, left_val: 0.7802296280860901 }, { features: [[3, 13, 4, 3, -1.], [3, 14, 4, 1, 3.]], threshold: -0.0120272999629378, right_val: 0.5032231807708740, left_val: 0.1585101038217545 }, { features: [[3, 7, 15, 5, -1.], [8, 7, 5, 5, 3.]], threshold: 0.1331661939620972, right_val: 0.2755128145217896, left_val: 0.5163304805755615 }, { features: [[3, 7, 12, 2, -1.], [7, 7, 4, 2, 3.]], threshold: -1.5221949433907866e-003, right_val: 0.5214552283287048, left_val: 0.3728317916393280 }, { features: [[10, 3, 3, 9, -1.], [11, 3, 1, 9, 3.]], threshold: -9.3929271679371595e-004, right_val: 0.4511165022850037, left_val: 0.5838379263877869 }, { features: [[8, 6, 4, 6, -1.], [10, 6, 2, 6, 2.]], threshold: 0.0277197398245335, right_val: 0.7331544756889343, left_val: 0.4728286862373352 }, { features: [[9, 7, 4, 3, -1.], [9, 8, 4, 1, 3.]], threshold: 3.1030150130391121e-003, right_val: 0.4101563096046448, left_val: 0.5302202105522156 }, { features: [[0, 9, 4, 9, -1.], [2, 9, 2, 9, 2.]], threshold: 0.0778612196445465, right_val: 0.1272961944341660, left_val: 0.4998334050178528 }, { features: [[9, 13, 3, 5, -1.], [10, 13, 1, 5, 3.]], threshold: -0.0158549398183823, right_val: 0.5165656208992004, left_val: 0.0508333593606949 }, { features: [[7, 7, 6, 3, -1.], [9, 7, 2, 3, 3.]], threshold: -4.9725300632417202e-003, right_val: 0.4684231877326965, left_val: 0.6798133850097656 }, { features: [[9, 7, 3, 5, -1.], [10, 7, 1, 5, 3.]], threshold: -9.7676506265997887e-004, right_val: 0.4788931906223297, left_val: 0.6010771989822388 }, { features: [[5, 7, 8, 2, -1.], [9, 7, 4, 2, 2.]], threshold: -2.4647710379213095e-003, right_val: 0.5220503807067871, left_val: 0.3393397927284241 }, { features: [[5, 9, 12, 2, -1.], [9, 9, 4, 2, 3.]], threshold: -6.7937700077891350e-003, right_val: 0.5239663124084473, left_val: 0.4365136921405792 }, { features: [[5, 6, 10, 3, -1.], [10, 6, 5, 3, 2.]], threshold: 0.0326080210506916, right_val: 0.2425214946269989, left_val: 0.5052723884582520 }, { features: [[10, 12, 3, 1, -1.], [11, 12, 1, 1, 3.]], threshold: -5.8514421107247472e-004, right_val: 0.4758574068546295, left_val: 0.5733973979949951 }, { features: [[0, 1, 11, 15, -1.], [0, 6, 11, 5, 3.]], threshold: -0.0296326000243425, right_val: 0.5263597965240479, left_val: 0.3892289102077484 }], threshold: 66.6691207885742190 }, { simpleClassifiers: [{ features: [[1, 0, 18, 6, -1.], [7, 0, 6, 6, 3.]], threshold: 0.0465508513152599, right_val: 0.6240522861480713, left_val: 0.3276950120925903 }, { features: [[7, 7, 6, 1, -1.], [9, 7, 2, 1, 3.]], threshold: 7.9537127166986465e-003, right_val: 0.6942939162254334, left_val: 0.4256485104560852 }, { features: [[5, 16, 6, 4, -1.], [5, 16, 3, 2, 2.], [8, 18, 3, 2, 2.]], threshold: 6.8221561377868056e-004, right_val: 0.5900732874870300, left_val: 0.3711487054824829 }, { features: [[6, 5, 9, 8, -1.], [6, 9, 9, 4, 2.]], threshold: -1.9348249770700932e-004, right_val: 0.5300545096397400, left_val: 0.2041133940219879 }, { features: [[5, 10, 2, 6, -1.], [5, 13, 2, 3, 2.]], threshold: -2.6710508973337710e-004, right_val: 0.3103179037570953, left_val: 0.5416126251220703 }, { features: [[7, 6, 8, 10, -1.], [11, 6, 4, 5, 2.], [7, 11, 4, 5, 2.]], threshold: 2.7818060480058193e-003, right_val: 0.3467069864273071, left_val: 0.5277832746505737 }, { features: [[5, 6, 8, 10, -1.], [5, 6, 4, 5, 2.], [9, 11, 4, 5, 2.]], threshold: -4.6779078547842801e-004, right_val: 0.3294492065906525, left_val: 0.5308231115341187 }, { features: [[9, 5, 2, 2, -1.], [9, 6, 2, 1, 2.]], threshold: -3.0335160772665404e-005, right_val: 0.3852097094058991, left_val: 0.5773872733116150 }, { features: [[5, 12, 8, 2, -1.], [5, 13, 8, 1, 2.]], threshold: 7.8038009814918041e-004, right_val: 0.6150057911872864, left_val: 0.4317438900470734 }, { features: [[10, 2, 8, 2, -1.], [10, 3, 8, 1, 2.]], threshold: -4.2553851380944252e-003, right_val: 0.5324292778968811, left_val: 0.2933903932571411 }, { features: [[4, 0, 2, 10, -1.], [4, 0, 1, 5, 2.], [5, 5, 1, 5, 2.]], threshold: -2.4735610350035131e-004, right_val: 0.3843030035495758, left_val: 0.5468844771385193 }, { features: [[9, 10, 2, 2, -1.], [9, 11, 2, 1, 2.]], threshold: -1.4724259381182492e-004, right_val: 0.5755587220191956, left_val: 0.4281542897224426 }, { features: [[2, 8, 15, 3, -1.], [2, 9, 15, 1, 3.]], threshold: 1.1864770203828812e-003, right_val: 0.5471466183662415, left_val: 0.3747301101684570 }, { features: [[8, 13, 4, 3, -1.], [8, 14, 4, 1, 3.]], threshold: 2.3936580400913954e-003, right_val: 0.6111528873443604, left_val: 0.4537783861160278 }, { features: [[7, 2, 3, 2, -1.], [8, 2, 1, 2, 3.]], threshold: -1.5390539774671197e-003, right_val: 0.5189538002014160, left_val: 0.2971341907978058 }, { features: [[7, 13, 6, 3, -1.], [7, 14, 6, 1, 3.]], threshold: -7.1968790143728256e-003, right_val: 0.4726476967334747, left_val: 0.6699066758155823 }, { features: [[9, 9, 2, 2, -1.], [9, 10, 2, 1, 2.]], threshold: -4.1499789222143590e-004, right_val: 0.5260317921638489, left_val: 0.3384954035282135 }, { features: [[17, 2, 3, 6, -1.], [17, 4, 3, 2, 3.]], threshold: 4.4359830208122730e-003, right_val: 0.3920140862464905, left_val: 0.5399122238159180 }, { features: [[1, 5, 3, 4, -1.], [2, 5, 1, 4, 3.]], threshold: 2.6606200262904167e-003, right_val: 0.6119617819786072, left_val: 0.4482578039169312 }, { features: [[14, 8, 4, 6, -1.], [14, 10, 4, 2, 3.]], threshold: -1.5287200221791863e-003, right_val: 0.5340266227722168, left_val: 0.3711237907409668 }, { features: [[1, 4, 3, 8, -1.], [2, 4, 1, 8, 3.]], threshold: -4.7397250309586525e-003, right_val: 0.4455145001411438, left_val: 0.6031088232994080 }, { features: [[8, 13, 4, 6, -1.], [8, 16, 4, 3, 2.]], threshold: -0.0148291299119592, right_val: 0.5341861844062805, left_val: 0.2838754057884216 }, { features: [[3, 14, 2, 2, -1.], [3, 15, 2, 1, 2.]], threshold: 9.2275557108223438e-004, right_val: 0.3361653983592987, left_val: 0.5209547281265259 }, { features: [[14, 8, 4, 6, -1.], [14, 10, 4, 2, 3.]], threshold: 0.0835298076272011, right_val: 0.0811644494533539, left_val: 0.5119969844818115 }, { features: [[2, 8, 4, 6, -1.], [2, 10, 4, 2, 3.]], threshold: -7.5633148662745953e-004, right_val: 0.5189831256866455, left_val: 0.3317120075225830 }, { features: [[10, 14, 1, 6, -1.], [10, 17, 1, 3, 2.]], threshold: 9.8403859883546829e-003, right_val: 0.2334959059953690, left_val: 0.5247598290443420 }, { features: [[7, 5, 3, 6, -1.], [8, 5, 1, 6, 3.]], threshold: -1.5953830443322659e-003, right_val: 0.4295622110366821, left_val: 0.5750094056129456 }, { features: [[11, 2, 2, 6, -1.], [12, 2, 1, 3, 2.], [11, 5, 1, 3, 2.]], threshold: 3.4766020689858124e-005, right_val: 0.5564029216766357, left_val: 0.4342445135116577 }, { features: [[6, 6, 6, 5, -1.], [8, 6, 2, 5, 3.]], threshold: 0.0298629105091095, right_val: 0.6579188108444214, left_val: 0.4579147100448608 }, { features: [[17, 1, 3, 6, -1.], [17, 3, 3, 2, 3.]], threshold: 0.0113255903124809, right_val: 0.3673888146877289, left_val: 0.5274311900138855 }, { features: [[8, 7, 3, 5, -1.], [9, 7, 1, 5, 3.]], threshold: -8.7828645482659340e-003, right_val: 0.4642167091369629, left_val: 0.7100368738174439 }, { features: [[9, 18, 3, 2, -1.], [10, 18, 1, 2, 3.]], threshold: 4.3639959767460823e-003, right_val: 0.2705877125263214, left_val: 0.5279216170310974 }, { features: [[8, 18, 3, 2, -1.], [9, 18, 1, 2, 3.]], threshold: 4.1804728098213673e-003, right_val: 0.2449083030223846, left_val: 0.5072525143623352 }, { features: [[12, 3, 5, 2, -1.], [12, 4, 5, 1, 2.]], threshold: -4.5668511302210391e-004, right_val: 0.5548691153526306, left_val: 0.4283105134963989 }, { features: [[7, 1, 5, 12, -1.], [7, 7, 5, 6, 2.]], threshold: -3.7140368949621916e-003, right_val: 0.4103653132915497, left_val: 0.5519387722015381 }, { features: [[1, 0, 18, 4, -1.], [7, 0, 6, 4, 3.]], threshold: -0.0253042895346880, right_val: 0.4869889020919800, left_val: 0.6867002248764038 }, { features: [[4, 2, 2, 2, -1.], [4, 3, 2, 1, 2.]], threshold: -3.4454080741852522e-004, right_val: 0.5287693142890930, left_val: 0.3728874027729034 }, { features: [[11, 14, 4, 2, -1.], [13, 14, 2, 1, 2.], [11, 15, 2, 1, 2.]], threshold: -8.3935231668874621e-004, right_val: 0.4616062045097351, left_val: 0.6060152053833008 }, { features: [[0, 2, 3, 6, -1.], [0, 4, 3, 2, 3.]], threshold: 0.0172800496220589, right_val: 0.1819823980331421, left_val: 0.5049635767936707 }, { features: [[9, 7, 2, 3, -1.], [9, 8, 2, 1, 3.]], threshold: -6.3595077954232693e-003, right_val: 0.5232778787612915, left_val: 0.1631239950656891 }, { features: [[5, 5, 1, 3, -1.], [5, 6, 1, 1, 3.]], threshold: 1.0298109846189618e-003, right_val: 0.6176549196243286, left_val: 0.4463278055191040 }, { features: [[10, 10, 6, 1, -1.], [10, 10, 3, 1, 2.]], threshold: 1.0117109632119536e-003, right_val: 0.4300698935985565, left_val: 0.5473384857177734 }, { features: [[4, 10, 6, 1, -1.], [7, 10, 3, 1, 2.]], threshold: -0.0103088002651930, right_val: 0.5000867247581482, left_val: 0.1166985034942627 }, { features: [[9, 17, 3, 3, -1.], [9, 18, 3, 1, 3.]], threshold: 5.4682018235325813e-003, right_val: 0.6719213724136353, left_val: 0.4769287109375000 }, { features: [[4, 14, 1, 3, -1.], [4, 15, 1, 1, 3.]], threshold: -9.1696460731327534e-004, right_val: 0.5178164839744568, left_val: 0.3471089899539948 }, { features: [[12, 5, 3, 3, -1.], [12, 6, 3, 1, 3.]], threshold: 2.3922820109874010e-003, right_val: 0.6216310858726502, left_val: 0.4785236120223999 }, { features: [[4, 5, 12, 3, -1.], [4, 6, 12, 1, 3.]], threshold: -7.5573818758130074e-003, right_val: 0.4410085082054138, left_val: 0.5814796090126038 }, { features: [[9, 8, 2, 3, -1.], [9, 9, 2, 1, 3.]], threshold: -7.7024032361805439e-004, right_val: 0.5465722084045410, left_val: 0.3878000080585480 }, { features: [[4, 9, 3, 3, -1.], [5, 9, 1, 3, 3.]], threshold: -8.7125990539789200e-003, right_val: 0.4995836019515991, left_val: 0.1660051047801971 }, { features: [[6, 0, 9, 17, -1.], [9, 0, 3, 17, 3.]], threshold: -0.0103063201531768, right_val: 0.5274233818054199, left_val: 0.4093391001224518 }, { features: [[9, 12, 1, 3, -1.], [9, 13, 1, 1, 3.]], threshold: -2.0940979011356831e-003, right_val: 0.4572280049324036, left_val: 0.6206194758415222 }, { features: [[9, 5, 2, 15, -1.], [9, 10, 2, 5, 3.]], threshold: 6.8099051713943481e-003, right_val: 0.4155600070953369, left_val: 0.5567759275436401 }, { features: [[8, 14, 2, 3, -1.], [8, 15, 2, 1, 3.]], threshold: -1.0746059706434608e-003, right_val: 0.4353024959564209, left_val: 0.5638927817344666 }, { features: [[10, 14, 1, 3, -1.], [10, 15, 1, 1, 3.]], threshold: 2.1550289820879698e-003, right_val: 0.6749758124351502, left_val: 0.4826265871524811 }, { features: [[7, 1, 6, 5, -1.], [9, 1, 2, 5, 3.]], threshold: 0.0317423194646835, right_val: 0.1883248984813690, left_val: 0.5048379898071289 }, { features: [[0, 0, 20, 2, -1.], [0, 0, 10, 2, 2.]], threshold: -0.0783827230334282, right_val: 0.5260158181190491, left_val: 0.2369548976421356 }, { features: [[2, 13, 5, 3, -1.], [2, 14, 5, 1, 3.]], threshold: 5.7415119372308254e-003, right_val: 0.2776469886302948, left_val: 0.5048828721046448 }, { features: [[9, 11, 2, 3, -1.], [9, 12, 2, 1, 3.]], threshold: -2.9014600440859795e-003, right_val: 0.4693317115306854, left_val: 0.6238604784011841 }, { features: [[2, 5, 9, 15, -1.], [2, 10, 9, 5, 3.]], threshold: -2.6427931152284145e-003, right_val: 0.5169777274131775, left_val: 0.3314141929149628 }, { features: [[5, 0, 12, 10, -1.], [11, 0, 6, 5, 2.], [5, 5, 6, 5, 2.]], threshold: -0.1094966009259224, right_val: 0.5183441042900085, left_val: 0.2380045056343079 }, { features: [[5, 1, 2, 3, -1.], [6, 1, 1, 3, 2.]], threshold: 7.4075913289561868e-005, right_val: 0.5362150073051453, left_val: 0.4069635868072510 }, { features: [[10, 7, 6, 1, -1.], [12, 7, 2, 1, 3.]], threshold: -5.0593802006915212e-004, right_val: 0.4374594092369080, left_val: 0.5506706237792969 }, { features: [[3, 1, 2, 10, -1.], [3, 1, 1, 5, 2.], [4, 6, 1, 5, 2.]], threshold: -8.2131777890026569e-004, right_val: 0.4209375977516174, left_val: 0.5525709986686707 }, { features: [[13, 7, 2, 1, -1.], [13, 7, 1, 1, 2.]], threshold: -6.0276539443293586e-005, right_val: 0.4748266041278839, left_val: 0.5455474853515625 }, { features: [[4, 13, 4, 6, -1.], [4, 15, 4, 2, 3.]], threshold: 6.8065142259001732e-003, right_val: 0.3424577116966248, left_val: 0.5157995820045471 }, { features: [[13, 7, 2, 1, -1.], [13, 7, 1, 1, 2.]], threshold: 1.7202789895236492e-003, right_val: 0.6331263780593872, left_val: 0.5013207793235779 }, { features: [[5, 7, 2, 1, -1.], [6, 7, 1, 1, 2.]], threshold: -1.3016929733566940e-004, right_val: 0.4226869940757752, left_val: 0.5539718270301819 }, { features: [[2, 12, 18, 4, -1.], [11, 12, 9, 2, 2.], [2, 14, 9, 2, 2.]], threshold: -4.8016388900578022e-003, right_val: 0.5430780053138733, left_val: 0.4425095021724701 }, { features: [[5, 7, 2, 2, -1.], [5, 7, 1, 1, 2.], [6, 8, 1, 1, 2.]], threshold: -2.5399310979992151e-003, right_val: 0.4697605073451996, left_val: 0.7145782113075256 }, { features: [[16, 3, 4, 2, -1.], [16, 4, 4, 1, 2.]], threshold: -1.4278929447755218e-003, right_val: 0.5399605035781860, left_val: 0.4070445001125336 }, { features: [[0, 2, 2, 18, -1.], [0, 2, 1, 9, 2.], [1, 11, 1, 9, 2.]], threshold: -0.0251425504684448, right_val: 0.4747352004051209, left_val: 0.7884690761566162 }, { features: [[1, 2, 18, 4, -1.], [10, 2, 9, 2, 2.], [1, 4, 9, 2, 2.]], threshold: -3.8899609353393316e-003, right_val: 0.5577110052108765, left_val: 0.4296191930770874 }, { features: [[9, 14, 1, 3, -1.], [9, 15, 1, 1, 3.]], threshold: 4.3947459198534489e-003, right_val: 0.7023944258689880, left_val: 0.4693162143230438 }, { features: [[2, 12, 18, 4, -1.], [11, 12, 9, 2, 2.], [2, 14, 9, 2, 2.]], threshold: 0.0246784202754498, right_val: 0.3812510073184967, left_val: 0.5242322087287903 }, { features: [[0, 12, 18, 4, -1.], [0, 12, 9, 2, 2.], [9, 14, 9, 2, 2.]], threshold: 0.0380476787686348, right_val: 0.1687828004360199, left_val: 0.5011739730834961 }, { features: [[11, 4, 5, 3, -1.], [11, 5, 5, 1, 3.]], threshold: 7.9424865543842316e-003, right_val: 0.6369568109512329, left_val: 0.4828582108020783 }, { features: [[6, 4, 7, 3, -1.], [6, 5, 7, 1, 3.]], threshold: -1.5110049862414598e-003, right_val: 0.4487667977809906, left_val: 0.5906485915184021 }, { features: [[13, 17, 3, 3, -1.], [13, 18, 3, 1, 3.]], threshold: 6.4201741479337215e-003, right_val: 0.2990570068359375, left_val: 0.5241097807884216 }, { features: [[8, 1, 3, 4, -1.], [9, 1, 1, 4, 3.]], threshold: -2.9802159406244755e-003, right_val: 0.5078489780426025, left_val: 0.3041465878486633 }, { features: [[11, 4, 2, 4, -1.], [11, 4, 1, 4, 2.]], threshold: -7.4580078944563866e-004, right_val: 0.5256826281547546, left_val: 0.4128139019012451 }, { features: [[0, 17, 9, 3, -1.], [3, 17, 3, 3, 3.]], threshold: -0.0104709500446916, right_val: 0.4494296014308929, left_val: 0.5808395147323608 }, { features: [[11, 0, 2, 8, -1.], [12, 0, 1, 4, 2.], [11, 4, 1, 4, 2.]], threshold: 9.3369204550981522e-003, right_val: 0.2658948898315430, left_val: 0.5246552824974060 }, { features: [[0, 8, 6, 12, -1.], [0, 8, 3, 6, 2.], [3, 14, 3, 6, 2.]], threshold: 0.0279369000345469, right_val: 0.7087256908416748, left_val: 0.4674955010414124 }, { features: [[10, 7, 4, 12, -1.], [10, 13, 4, 6, 2.]], threshold: 7.4277678504586220e-003, right_val: 0.3758518099784851, left_val: 0.5409486889839172 }, { features: [[5, 3, 8, 14, -1.], [5, 10, 8, 7, 2.]], threshold: -0.0235845092684031, right_val: 0.5238550901412964, left_val: 0.3758639991283417 }, { features: [[14, 10, 6, 1, -1.], [14, 10, 3, 1, 2.]], threshold: 1.1452640173956752e-003, right_val: 0.5804247260093689, left_val: 0.4329578876495361 }, { features: [[0, 4, 10, 4, -1.], [0, 6, 10, 2, 2.]], threshold: -4.3468660442158580e-004, right_val: 0.3873069882392883, left_val: 0.5280618071556091 }, { features: [[10, 0, 5, 8, -1.], [10, 4, 5, 4, 2.]], threshold: 0.0106485402211547, right_val: 0.5681251883506775, left_val: 0.4902113080024719 }, { features: [[8, 1, 4, 8, -1.], [8, 1, 2, 4, 2.], [10, 5, 2, 4, 2.]], threshold: -3.9418050437234342e-004, right_val: 0.4318251013755798, left_val: 0.5570880174636841 }, { features: [[9, 11, 6, 1, -1.], [11, 11, 2, 1, 3.]], threshold: -1.3270479394122958e-004, right_val: 0.4343554973602295, left_val: 0.5658439993858337 }, { features: [[8, 9, 3, 4, -1.], [9, 9, 1, 4, 3.]], threshold: -2.0125510636717081e-003, right_val: 0.4537523984909058, left_val: 0.6056739091873169 }, { features: [[18, 4, 2, 6, -1.], [18, 6, 2, 2, 3.]], threshold: 2.4854319635778666e-003, right_val: 0.4138010144233704, left_val: 0.5390477180480957 }, { features: [[8, 8, 3, 4, -1.], [9, 8, 1, 4, 3.]], threshold: 1.8237880431115627e-003, right_val: 0.5717188715934753, left_val: 0.4354828894138336 }, { features: [[7, 1, 13, 3, -1.], [7, 2, 13, 1, 3.]], threshold: -0.0166566595435143, right_val: 0.5216122865676880, left_val: 0.3010913133621216 }, { features: [[7, 13, 6, 1, -1.], [9, 13, 2, 1, 3.]], threshold: 8.0349558265879750e-004, right_val: 0.3818396925926209, left_val: 0.5300151109695435 }, { features: [[12, 11, 3, 6, -1.], [12, 13, 3, 2, 3.]], threshold: 3.4170378930866718e-003, right_val: 0.4241400063037872, left_val: 0.5328028798103333 }, { features: [[5, 11, 6, 1, -1.], [7, 11, 2, 1, 3.]], threshold: -3.6222729249857366e-004, right_val: 0.4186977148056030, left_val: 0.5491728186607361 }, { features: [[1, 4, 18, 10, -1.], [10, 4, 9, 5, 2.], [1, 9, 9, 5, 2.]], threshold: -0.1163002029061317, right_val: 0.5226451158523560, left_val: 0.1440722048282623 }, { features: [[8, 6, 4, 9, -1.], [8, 9, 4, 3, 3.]], threshold: -0.0146950101479888, right_val: 0.4715717136859894, left_val: 0.7747725248336792 }, { features: [[8, 6, 4, 3, -1.], [8, 7, 4, 1, 3.]], threshold: 2.1972130052745342e-003, right_val: 0.3315644860267639, left_val: 0.5355433821678162 }, { features: [[8, 7, 3, 3, -1.], [9, 7, 1, 3, 3.]], threshold: -4.6965209185145795e-004, right_val: 0.4458136856555939, left_val: 0.5767235159873962 }, { features: [[14, 15, 4, 3, -1.], [14, 16, 4, 1, 3.]], threshold: 6.5144998952746391e-003, right_val: 0.3647888898849487, left_val: 0.5215674042701721 }, { features: [[5, 10, 3, 10, -1.], [6, 10, 1, 10, 3.]], threshold: 0.0213000606745481, right_val: 0.1567950993776321, left_val: 0.4994204938411713 }, { features: [[8, 15, 4, 3, -1.], [8, 16, 4, 1, 3.]], threshold: 3.1881409231573343e-003, right_val: 0.6287270188331604, left_val: 0.4742200076580048 }, { features: [[0, 8, 1, 6, -1.], [0, 10, 1, 2, 3.]], threshold: 9.0019777417182922e-004, right_val: 0.3943752050399780, left_val: 0.5347954034805298 }, { features: [[10, 15, 1, 3, -1.], [10, 16, 1, 1, 3.]], threshold: -5.1772277802228928e-003, right_val: 0.5013138055801392, left_val: 0.6727191805839539 }, { features: [[2, 15, 4, 3, -1.], [2, 16, 4, 1, 3.]], threshold: -4.3764649890363216e-003, right_val: 0.5128793120384216, left_val: 0.3106675148010254 }, { features: [[18, 3, 2, 8, -1.], [19, 3, 1, 4, 2.], [18, 7, 1, 4, 2.]], threshold: 2.6299960445612669e-003, right_val: 0.5755215883255005, left_val: 0.4886310100555420 }, { features: [[0, 3, 2, 8, -1.], [0, 3, 1, 4, 2.], [1, 7, 1, 4, 2.]], threshold: -2.0458688959479332e-003, right_val: 0.4558076858520508, left_val: 0.6025794148445129 }, { features: [[3, 7, 14, 10, -1.], [10, 7, 7, 5, 2.], [3, 12, 7, 5, 2.]], threshold: 0.0694827064871788, right_val: 0.2185259014368057, left_val: 0.5240747928619385 }, { features: [[0, 7, 19, 3, -1.], [0, 8, 19, 1, 3.]], threshold: 0.0240489393472672, right_val: 0.2090622037649155, left_val: 0.5011867284774780 }, { features: [[12, 6, 3, 3, -1.], [12, 7, 3, 1, 3.]], threshold: 3.1095340382307768e-003, right_val: 0.7108548283576965, left_val: 0.4866712093353272 }, { features: [[0, 6, 1, 3, -1.], [0, 7, 1, 1, 3.]], threshold: -1.2503260513767600e-003, right_val: 0.5156195163726807, left_val: 0.3407891094684601 }, { features: [[12, 6, 3, 3, -1.], [12, 7, 3, 1, 3.]], threshold: -1.0281190043315291e-003, right_val: 0.4439432024955750, left_val: 0.5575572252273560 }, { features: [[5, 6, 3, 3, -1.], [5, 7, 3, 1, 3.]], threshold: -8.8893622159957886e-003, right_val: 0.4620442092418671, left_val: 0.6402000784873962 }, { features: [[8, 2, 4, 2, -1.], [8, 3, 4, 1, 2.]], threshold: -6.1094801640138030e-004, right_val: 0.5448899865150452, left_val: 0.3766441941261292 }, { features: [[6, 3, 4, 12, -1.], [8, 3, 2, 12, 2.]], threshold: -5.7686357758939266e-003, right_val: 0.5133677124977112, left_val: 0.3318648934364319 }, { features: [[13, 6, 2, 3, -1.], [13, 7, 2, 1, 3.]], threshold: 1.8506490159779787e-003, right_val: 0.6406934857368469, left_val: 0.4903570115566254 }, { features: [[0, 10, 20, 4, -1.], [0, 12, 20, 2, 2.]], threshold: -0.0997994691133499, right_val: 0.5015562176704407, left_val: 0.1536051034927368 }, { features: [[2, 0, 17, 14, -1.], [2, 7, 17, 7, 2.]], threshold: -0.3512834906578064, right_val: 0.5174378752708435, left_val: 0.0588231310248375 }, { features: [[0, 0, 6, 10, -1.], [0, 0, 3, 5, 2.], [3, 5, 3, 5, 2.]], threshold: -0.0452445708215237, right_val: 0.4677872955799103, left_val: 0.6961488723754883 }, { features: [[14, 6, 6, 4, -1.], [14, 6, 3, 4, 2.]], threshold: 0.0714815780520439, right_val: 0.1038092970848084, left_val: 0.5167986154556274 }, { features: [[0, 6, 6, 4, -1.], [3, 6, 3, 4, 2.]], threshold: 2.1895780228078365e-003, right_val: 0.5532060861587524, left_val: 0.4273078143596649 }, { features: [[13, 2, 7, 2, -1.], [13, 3, 7, 1, 2.]], threshold: -5.9242651332169771e-004, right_val: 0.5276389122009277, left_val: 0.4638943970203400 }, { features: [[0, 2, 7, 2, -1.], [0, 3, 7, 1, 2.]], threshold: 1.6788389766588807e-003, right_val: 0.3932034969329834, left_val: 0.5301648974418640 }, { features: [[6, 11, 14, 2, -1.], [13, 11, 7, 1, 2.], [6, 12, 7, 1, 2.]], threshold: -2.2163488902151585e-003, right_val: 0.4757033884525299, left_val: 0.5630694031715393 }, { features: [[8, 5, 2, 2, -1.], [8, 5, 1, 1, 2.], [9, 6, 1, 1, 2.]], threshold: 1.1568699846975505e-004, right_val: 0.5535702705383301, left_val: 0.4307535886764526 }, { features: [[13, 9, 2, 3, -1.], [13, 9, 1, 3, 2.]], threshold: -7.2017288766801357e-003, right_val: 0.5193064212799072, left_val: 0.1444882005453110 }, { features: [[1, 1, 3, 12, -1.], [2, 1, 1, 12, 3.]], threshold: 8.9081272017210722e-004, right_val: 0.5593621134757996, left_val: 0.4384432137012482 }, { features: [[17, 4, 1, 3, -1.], [17, 5, 1, 1, 3.]], threshold: 1.9605009583756328e-004, right_val: 0.4705956876277924, left_val: 0.5340415835380554 }, { features: [[2, 4, 1, 3, -1.], [2, 5, 1, 1, 3.]], threshold: 5.2022142335772514e-004, right_val: 0.3810079097747803, left_val: 0.5213856101036072 }, { features: [[14, 5, 1, 3, -1.], [14, 6, 1, 1, 3.]], threshold: 9.4588572392240167e-004, right_val: 0.6130738854408264, left_val: 0.4769414961338043 }, { features: [[7, 16, 2, 3, -1.], [7, 17, 2, 1, 3.]], threshold: 9.1698471806012094e-005, right_val: 0.5429363250732422, left_val: 0.4245009124279022 }, { features: [[8, 13, 4, 6, -1.], [10, 13, 2, 3, 2.], [8, 16, 2, 3, 2.]], threshold: 2.1833200007677078e-003, right_val: 0.4191075861454010, left_val: 0.5457730889320374 }, { features: [[5, 5, 1, 3, -1.], [5, 6, 1, 1, 3.]], threshold: -8.6039671441540122e-004, right_val: 0.4471659958362579, left_val: 0.5764588713645935 }, { features: [[16, 0, 4, 20, -1.], [16, 0, 2, 20, 2.]], threshold: -0.0132362395524979, right_val: 0.4695009887218475, left_val: 0.6372823119163513 }, { features: [[5, 1, 2, 6, -1.], [5, 1, 1, 3, 2.], [6, 4, 1, 3, 2.]], threshold: 4.3376701069064438e-004, right_val: 0.3945829868316650, left_val: 0.5317873954772949 }], threshold: 67.6989212036132810 }, { simpleClassifiers: [{ features: [[5, 4, 10, 4, -1.], [5, 6, 10, 2, 2.]], threshold: -0.0248471498489380, right_val: 0.3873311877250671, left_val: 0.6555516719818115 }, { features: [[15, 2, 4, 12, -1.], [15, 2, 2, 12, 2.]], threshold: 6.1348611488938332e-003, right_val: 0.5973997712135315, left_val: 0.3748072087764740 }, { features: [[7, 6, 4, 12, -1.], [7, 12, 4, 6, 2.]], threshold: 6.4498498104512691e-003, right_val: 0.2548811137676239, left_val: 0.5425491929054260 }, { features: [[14, 5, 1, 8, -1.], [14, 9, 1, 4, 2.]], threshold: 6.3491211039945483e-004, right_val: 0.5387253761291504, left_val: 0.2462442070245743 }, { features: [[1, 4, 14, 10, -1.], [1, 4, 7, 5, 2.], [8, 9, 7, 5, 2.]], threshold: 1.4023890253156424e-003, right_val: 0.3528657853603363, left_val: 0.5594322085380554 }, { features: [[11, 6, 6, 14, -1.], [14, 6, 3, 7, 2.], [11, 13, 3, 7, 2.]], threshold: 3.0044000595808029e-004, right_val: 0.5765938162803650, left_val: 0.3958503901958466 }, { features: [[3, 6, 6, 14, -1.], [3, 6, 3, 7, 2.], [6, 13, 3, 7, 2.]], threshold: 1.0042409849120304e-004, right_val: 0.5534998178482056, left_val: 0.3698996901512146 }, { features: [[4, 9, 15, 2, -1.], [9, 9, 5, 2, 3.]], threshold: -5.0841490738093853e-003, right_val: 0.5547800064086914, left_val: 0.3711090981960297 }, { features: [[7, 14, 6, 3, -1.], [7, 15, 6, 1, 3.]], threshold: -0.0195372607558966, right_val: 0.4579297006130219, left_val: 0.7492755055427551 }, { features: [[6, 3, 14, 4, -1.], [13, 3, 7, 2, 2.], [6, 5, 7, 2, 2.]], threshold: -7.4532740654831287e-006, right_val: 0.3904069960117340, left_val: 0.5649787187576294 }, { features: [[1, 9, 15, 2, -1.], [6, 9, 5, 2, 3.]], threshold: -3.6079459823668003e-003, right_val: 0.5267801284790039, left_val: 0.3381088078022003 }, { features: [[6, 11, 8, 9, -1.], [6, 14, 8, 3, 3.]], threshold: 2.0697501022368670e-003, right_val: 0.3714388906955719, left_val: 0.5519291162490845 }, { features: [[7, 4, 3, 8, -1.], [8, 4, 1, 8, 3.]], threshold: -4.6463840408250690e-004, right_val: 0.4113566875457764, left_val: 0.5608214735984802 }, { features: [[14, 6, 2, 6, -1.], [14, 9, 2, 3, 2.]], threshold: 7.5490452582016587e-004, right_val: 0.5329356193542481, left_val: 0.3559206128120422 }, { features: [[5, 7, 6, 4, -1.], [5, 7, 3, 2, 2.], [8, 9, 3, 2, 2.]], threshold: -9.8322238773107529e-004, right_val: 0.3763205111026764, left_val: 0.5414795875549316 }, { features: [[1, 1, 18, 19, -1.], [7, 1, 6, 19, 3.]], threshold: -0.0199406407773495, right_val: 0.4705299139022827, left_val: 0.6347903013229370 }, { features: [[1, 2, 6, 5, -1.], [4, 2, 3, 5, 2.]], threshold: 3.7680300883948803e-003, right_val: 0.5563716292381287, left_val: 0.3913489878177643 }, { features: [[12, 17, 6, 2, -1.], [12, 18, 6, 1, 2.]], threshold: -9.4528505578637123e-003, right_val: 0.5215116739273071, left_val: 0.2554892897605896 }, { features: [[2, 17, 6, 2, -1.], [2, 18, 6, 1, 2.]], threshold: 2.9560849070549011e-003, right_val: 0.3063920140266419, left_val: 0.5174679160118103 }, { features: [[17, 3, 3, 6, -1.], [17, 5, 3, 2, 3.]], threshold: 9.1078737750649452e-003, right_val: 0.2885963022708893, left_val: 0.5388448238372803 }, { features: [[8, 17, 3, 3, -1.], [8, 18, 3, 1, 3.]], threshold: 1.8219229532405734e-003, right_val: 0.5852196812629700, left_val: 0.4336043000221252 }, { features: [[10, 13, 2, 6, -1.], [10, 16, 2, 3, 2.]], threshold: 0.0146887395530939, right_val: 0.2870005965232849, left_val: 0.5287361741065979 }, { features: [[7, 13, 6, 3, -1.], [7, 14, 6, 1, 3.]], threshold: -0.0143879903480411, right_val: 0.4647370874881744, left_val: 0.7019448876380920 }, { features: [[17, 3, 3, 6, -1.], [17, 5, 3, 2, 3.]], threshold: -0.0189866498112679, right_val: 0.5247011780738831, left_val: 0.2986552119255066 }, { features: [[8, 13, 2, 3, -1.], [8, 14, 2, 1, 3.]], threshold: 1.1527639580890536e-003, right_val: 0.5931661725044251, left_val: 0.4323473870754242 }, { features: [[9, 3, 6, 2, -1.], [11, 3, 2, 2, 3.]], threshold: 0.0109336702153087, right_val: 0.3130319118499756, left_val: 0.5286864042282105 }, { features: [[0, 3, 3, 6, -1.], [0, 5, 3, 2, 3.]], threshold: -0.0149327302351594, right_val: 0.5084077119827271, left_val: 0.2658419013023377 }, { features: [[8, 5, 4, 6, -1.], [8, 7, 4, 2, 3.]], threshold: -2.9970539617352188e-004, right_val: 0.3740724027156830, left_val: 0.5463526844978333 }, { features: [[5, 5, 3, 2, -1.], [5, 6, 3, 1, 2.]], threshold: 4.1677621193230152e-003, right_val: 0.7435721755027771, left_val: 0.4703496992588043 }, { features: [[10, 1, 3, 4, -1.], [11, 1, 1, 4, 3.]], threshold: -6.3905320130288601e-003, right_val: 0.5280538201332092, left_val: 0.2069258987903595 }, { features: [[1, 2, 5, 9, -1.], [1, 5, 5, 3, 3.]], threshold: 4.5029609464108944e-003, right_val: 0.3483543097972870, left_val: 0.5182648897171021 }, { features: [[13, 6, 2, 3, -1.], [13, 7, 2, 1, 3.]], threshold: -9.2040365561842918e-003, right_val: 0.4932360053062439, left_val: 0.6803777217864990 }, { features: [[0, 6, 14, 3, -1.], [7, 6, 7, 3, 2.]], threshold: 0.0813272595405579, right_val: 0.2253051996231079, left_val: 0.5058398842811585 }, { features: [[2, 11, 18, 8, -1.], [2, 15, 18, 4, 2.]], threshold: -0.1507928073406220, right_val: 0.5264679789543152, left_val: 0.2963424921035767 }, { features: [[5, 6, 2, 3, -1.], [5, 7, 2, 1, 3.]], threshold: 3.3179009333252907e-003, right_val: 0.7072932124137878, left_val: 0.4655495882034302 }, { features: [[10, 6, 4, 2, -1.], [12, 6, 2, 1, 2.], [10, 7, 2, 1, 2.]], threshold: 7.7402801252901554e-004, right_val: 0.5668237805366516, left_val: 0.4780347943305969 }, { features: [[6, 6, 4, 2, -1.], [6, 6, 2, 1, 2.], [8, 7, 2, 1, 2.]], threshold: 6.8199541419744492e-004, right_val: 0.5722156763076782, left_val: 0.4286996126174927 }, { features: [[10, 1, 3, 4, -1.], [11, 1, 1, 4, 3.]], threshold: 5.3671570494771004e-003, right_val: 0.3114621937274933, left_val: 0.5299307107925415 }, { features: [[7, 1, 2, 7, -1.], [8, 1, 1, 7, 2.]], threshold: 9.7018666565418243e-005, right_val: 0.5269461870193481, left_val: 0.3674638867378235 }, { features: [[4, 2, 15, 14, -1.], [4, 9, 15, 7, 2.]], threshold: -0.1253408938646317, right_val: 0.5245791077613831, left_val: 0.2351492047309876 }, { features: [[8, 7, 3, 2, -1.], [9, 7, 1, 2, 3.]], threshold: -5.2516269497573376e-003, right_val: 0.4693767130374908, left_val: 0.7115936875343323 }, { features: [[2, 3, 18, 4, -1.], [11, 3, 9, 2, 2.], [2, 5, 9, 2, 2.]], threshold: -7.8342109918594360e-003, right_val: 0.5409085750579834, left_val: 0.4462651014328003 }, { features: [[9, 7, 2, 2, -1.], [10, 7, 1, 2, 2.]], threshold: -1.1310069821774960e-003, right_val: 0.4417662024497986, left_val: 0.5945618748664856 }, { features: [[13, 9, 2, 3, -1.], [13, 9, 1, 3, 2.]], threshold: 1.7601120052859187e-003, right_val: 0.3973453044891357, left_val: 0.5353249907493591 }, { features: [[5, 2, 6, 2, -1.], [7, 2, 2, 2, 3.]], threshold: -8.1581249833106995e-004, right_val: 0.5264726877212524, left_val: 0.3760268092155457 }, { features: [[9, 5, 2, 7, -1.], [9, 5, 1, 7, 2.]], threshold: -3.8687589112669230e-003, right_val: 0.4749819934368134, left_val: 0.6309912800788879 }, { features: [[5, 9, 2, 3, -1.], [6, 9, 1, 3, 2.]], threshold: 1.5207129763439298e-003, right_val: 0.3361223936080933, left_val: 0.5230181813240051 }, { features: [[6, 0, 14, 18, -1.], [6, 9, 14, 9, 2.]], threshold: 0.5458673834800720, right_val: 0.1172635033726692, left_val: 0.5167139768600464 }, { features: [[2, 16, 6, 3, -1.], [2, 17, 6, 1, 3.]], threshold: 0.0156501904129982, right_val: 0.1393294930458069, left_val: 0.4979439079761505 }, { features: [[9, 7, 3, 6, -1.], [10, 7, 1, 6, 3.]], threshold: -0.0117318602278829, right_val: 0.4921196103096008, left_val: 0.7129650712013245 }, { features: [[7, 8, 4, 3, -1.], [7, 9, 4, 1, 3.]], threshold: -6.1765122227370739e-003, right_val: 0.5049701929092407, left_val: 0.2288102954626083 }, { features: [[7, 12, 6, 3, -1.], [7, 13, 6, 1, 3.]], threshold: 2.2457661107182503e-003, right_val: 0.6048725843429565, left_val: 0.4632433950901032 }, { features: [[9, 12, 2, 3, -1.], [9, 13, 2, 1, 3.]], threshold: -5.1915869116783142e-003, right_val: 0.4602192938327789, left_val: 0.6467421054840088 }, { features: [[7, 12, 6, 2, -1.], [9, 12, 2, 2, 3.]], threshold: -0.0238278806209564, right_val: 0.5226079225540161, left_val: 0.1482000946998596 }, { features: [[5, 11, 4, 6, -1.], [5, 14, 4, 3, 2.]], threshold: 1.0284580057486892e-003, right_val: 0.3375957012176514, left_val: 0.5135489106178284 }, { features: [[11, 12, 7, 2, -1.], [11, 13, 7, 1, 2.]], threshold: -0.0100788502022624, right_val: 0.5303567051887512, left_val: 0.2740561068058014 }, { features: [[6, 10, 8, 6, -1.], [6, 10, 4, 3, 2.], [10, 13, 4, 3, 2.]], threshold: 2.6168930344283581e-003, right_val: 0.3972454071044922, left_val: 0.5332670807838440 }, { features: [[11, 10, 3, 4, -1.], [11, 12, 3, 2, 2.]], threshold: 5.4385367548093200e-004, right_val: 0.4063411951065064, left_val: 0.5365604162216187 }, { features: [[9, 16, 2, 3, -1.], [9, 17, 2, 1, 3.]], threshold: 5.3510512225329876e-003, right_val: 0.6889045834541321, left_val: 0.4653759002685547 }, { features: [[13, 3, 1, 9, -1.], [13, 6, 1, 3, 3.]], threshold: -1.5274790348485112e-003, right_val: 0.3624723851680756, left_val: 0.5449501276016235 }, { features: [[1, 13, 14, 6, -1.], [1, 15, 14, 2, 3.]], threshold: -0.0806244164705276, right_val: 0.5000287294387817, left_val: 0.1656087040901184 }, { features: [[13, 6, 1, 6, -1.], [13, 9, 1, 3, 2.]], threshold: 0.0221920292824507, right_val: 0.2002808004617691, left_val: 0.5132731199264526 }, { features: [[0, 4, 3, 8, -1.], [1, 4, 1, 8, 3.]], threshold: 7.3100631125271320e-003, right_val: 0.6366536021232605, left_val: 0.4617947936058044 }, { features: [[18, 0, 2, 18, -1.], [18, 0, 1, 18, 2.]], threshold: -6.4063072204589844e-003, right_val: 0.4867860972881317, left_val: 0.5916250944137573 }, { features: [[2, 3, 6, 2, -1.], [2, 4, 6, 1, 2.]], threshold: -7.6415040530264378e-004, right_val: 0.5315797924995422, left_val: 0.3888409137725830 }, { features: [[9, 0, 8, 6, -1.], [9, 2, 8, 2, 3.]], threshold: 7.6734489994123578e-004, right_val: 0.5605279803276062, left_val: 0.4159064888954163 }, { features: [[6, 6, 1, 6, -1.], [6, 9, 1, 3, 2.]], threshold: 6.1474501853808761e-004, right_val: 0.5120148062705994, left_val: 0.3089022040367127 }, { features: [[14, 8, 6, 3, -1.], [14, 9, 6, 1, 3.]], threshold: -5.0105270929634571e-003, right_val: 0.5207306146621704, left_val: 0.3972199857234955 }, { features: [[0, 0, 2, 18, -1.], [1, 0, 1, 18, 2.]], threshold: -8.6909132078289986e-003, right_val: 0.4608575999736786, left_val: 0.6257408261299133 }, { features: [[1, 18, 18, 2, -1.], [10, 18, 9, 1, 2.], [1, 19, 9, 1, 2.]], threshold: -0.0163914598524570, right_val: 0.5242266058921814, left_val: 0.2085209935903549 }, { features: [[3, 15, 2, 2, -1.], [3, 16, 2, 1, 2.]], threshold: 4.0973909199237823e-004, right_val: 0.3780320882797241, left_val: 0.5222427248954773 }, { features: [[8, 14, 5, 3, -1.], [8, 15, 5, 1, 3.]], threshold: -2.5242289993911982e-003, right_val: 0.4611890017986298, left_val: 0.5803927183151245 }, { features: [[8, 14, 2, 3, -1.], [8, 15, 2, 1, 3.]], threshold: 5.0945312250405550e-004, right_val: 0.5846015810966492, left_val: 0.4401271939277649 }, { features: [[12, 3, 3, 3, -1.], [13, 3, 1, 3, 3.]], threshold: 1.9656419754028320e-003, right_val: 0.4184590876102448, left_val: 0.5322325229644775 }, { features: [[7, 5, 6, 2, -1.], [9, 5, 2, 2, 3.]], threshold: 5.6298897834494710e-004, right_val: 0.5234565734863281, left_val: 0.3741844892501831 }, { features: [[15, 5, 5, 2, -1.], [15, 6, 5, 1, 2.]], threshold: -6.7946797935292125e-004, right_val: 0.5356478095054627, left_val: 0.4631041884422302 }, { features: [[0, 5, 5, 2, -1.], [0, 6, 5, 1, 2.]], threshold: 7.2856349870562553e-003, right_val: 0.2377564013004303, left_val: 0.5044670104980469 }, { features: [[17, 14, 1, 6, -1.], [17, 17, 1, 3, 2.]], threshold: -0.0174594894051552, right_val: 0.5050435066223145, left_val: 0.7289121150970459 }, { features: [[2, 9, 9, 3, -1.], [5, 9, 3, 3, 3.]], threshold: -0.0254217498004436, right_val: 0.4678100049495697, left_val: 0.6667134761810303 }, { features: [[12, 3, 3, 3, -1.], [13, 3, 1, 3, 3.]], threshold: -1.5647639520466328e-003, right_val: 0.5323626995086670, left_val: 0.4391759037971497 }, { features: [[0, 0, 4, 18, -1.], [2, 0, 2, 18, 2.]], threshold: 0.0114443600177765, right_val: 0.5680012106895447, left_val: 0.4346440136432648 }, { features: [[17, 6, 1, 3, -1.], [17, 7, 1, 1, 3.]], threshold: -6.7352550104260445e-004, right_val: 0.5296812057495117, left_val: 0.4477140903472900 }, { features: [[2, 14, 1, 6, -1.], [2, 17, 1, 3, 2.]], threshold: 9.3194209039211273e-003, right_val: 0.7462607026100159, left_val: 0.4740200042724609 }, { features: [[19, 8, 1, 2, -1.], [19, 9, 1, 1, 2.]], threshold: 1.3328490604180843e-004, right_val: 0.4752134978771210, left_val: 0.5365061759948731 }, { features: [[5, 3, 3, 3, -1.], [6, 3, 1, 3, 3.]], threshold: -7.8815799206495285e-003, right_val: 0.5015255212783814, left_val: 0.1752219051122665 }, { features: [[9, 16, 2, 3, -1.], [9, 17, 2, 1, 3.]], threshold: -5.7985680177807808e-003, right_val: 0.4896200895309448, left_val: 0.7271236777305603 }, { features: [[2, 6, 1, 3, -1.], [2, 7, 1, 1, 3.]], threshold: -3.8922499516047537e-004, right_val: 0.5344941020011902, left_val: 0.4003908932209015 }, { features: [[12, 4, 8, 2, -1.], [16, 4, 4, 1, 2.], [12, 5, 4, 1, 2.]], threshold: -1.9288610201328993e-003, right_val: 0.4803955852985382, left_val: 0.5605612993240356 }, { features: [[0, 4, 8, 2, -1.], [0, 4, 4, 1, 2.], [4, 5, 4, 1, 2.]], threshold: 8.4214154630899429e-003, right_val: 0.7623608708381653, left_val: 0.4753246903419495 }, { features: [[2, 16, 18, 4, -1.], [2, 18, 18, 2, 2.]], threshold: 8.1655876711010933e-003, right_val: 0.4191643893718720, left_val: 0.5393261909484863 }, { features: [[7, 15, 2, 4, -1.], [7, 17, 2, 2, 2.]], threshold: 4.8280550981871784e-004, right_val: 0.5399821996688843, left_val: 0.4240800142288208 }, { features: [[4, 0, 14, 3, -1.], [4, 1, 14, 1, 3.]], threshold: -2.7186630759388208e-003, right_val: 0.5424923896789551, left_val: 0.4244599938392639 }, { features: [[0, 0, 4, 20, -1.], [2, 0, 2, 20, 2.]], threshold: -0.0125072300434113, right_val: 0.4550411105155945, left_val: 0.5895841717720032 }, { features: [[12, 4, 4, 8, -1.], [14, 4, 2, 4, 2.], [12, 8, 2, 4, 2.]], threshold: -0.0242865197360516, right_val: 0.5189179778099060, left_val: 0.2647134959697723 }, { features: [[6, 7, 2, 2, -1.], [6, 7, 1, 1, 2.], [7, 8, 1, 1, 2.]], threshold: -2.9676330741494894e-003, right_val: 0.4749749898910523, left_val: 0.7347682714462280 }, { features: [[10, 6, 2, 3, -1.], [10, 7, 2, 1, 3.]], threshold: -0.0125289997085929, right_val: 0.5177599787712097, left_val: 0.2756049931049347 }, { features: [[8, 7, 3, 2, -1.], [8, 8, 3, 1, 2.]], threshold: -1.0104000102728605e-003, right_val: 0.5144724249839783, left_val: 0.3510560989379883 }, { features: [[8, 2, 6, 12, -1.], [8, 8, 6, 6, 2.]], threshold: -2.1348530426621437e-003, right_val: 0.4667319953441620, left_val: 0.5637925863265991 }, { features: [[4, 0, 11, 12, -1.], [4, 4, 11, 4, 3.]], threshold: 0.0195642597973347, right_val: 0.6137639880180359, left_val: 0.4614573121070862 }, { features: [[14, 9, 6, 11, -1.], [16, 9, 2, 11, 3.]], threshold: -0.0971463471651077, right_val: 0.5193555951118469, left_val: 0.2998378872871399 }, { features: [[0, 14, 4, 3, -1.], [0, 15, 4, 1, 3.]], threshold: 4.5014568604528904e-003, right_val: 0.3045755922794342, left_val: 0.5077884793281555 }, { features: [[9, 10, 2, 3, -1.], [9, 11, 2, 1, 3.]], threshold: 6.3706971704959869e-003, right_val: 0.6887500882148743, left_val: 0.4861018955707550 }, { features: [[5, 11, 3, 2, -1.], [5, 12, 3, 1, 2.]], threshold: -9.0721528977155685e-003, right_val: 0.5017563104629517, left_val: 0.1673395931720734 }, { features: [[9, 15, 3, 3, -1.], [10, 15, 1, 3, 3.]], threshold: -5.3537208586931229e-003, right_val: 0.5242633223533630, left_val: 0.2692756950855255 }, { features: [[8, 8, 3, 4, -1.], [9, 8, 1, 4, 3.]], threshold: -0.0109328404068947, right_val: 0.4736028909683228, left_val: 0.7183864116668701 }, { features: [[9, 15, 3, 3, -1.], [10, 15, 1, 3, 3.]], threshold: 8.2356072962284088e-003, right_val: 0.2389862984418869, left_val: 0.5223966836929321 }, { features: [[7, 7, 3, 2, -1.], [8, 7, 1, 2, 3.]], threshold: -1.0038160253316164e-003, right_val: 0.4433943033218384, left_val: 0.5719355940818787 }, { features: [[2, 10, 16, 4, -1.], [10, 10, 8, 2, 2.], [2, 12, 8, 2, 2.]], threshold: 4.0859128348529339e-003, right_val: 0.4148836135864258, left_val: 0.5472841858863831 }, { features: [[2, 3, 4, 17, -1.], [4, 3, 2, 17, 2.]], threshold: 0.1548541933298111, right_val: 0.0610615983605385, left_val: 0.4973812103271484 }, { features: [[15, 13, 2, 7, -1.], [15, 13, 1, 7, 2.]], threshold: 2.0897459762636572e-004, right_val: 0.5423889160156250, left_val: 0.4709174036979675 }, { features: [[2, 2, 6, 1, -1.], [5, 2, 3, 1, 2.]], threshold: 3.3316991175524890e-004, right_val: 0.5300992131233215, left_val: 0.4089626967906952 }, { features: [[5, 2, 12, 4, -1.], [9, 2, 4, 4, 3.]], threshold: -0.0108134001493454, right_val: 0.4957334101200104, left_val: 0.6104369759559631 }, { features: [[6, 0, 8, 12, -1.], [6, 0, 4, 6, 2.], [10, 6, 4, 6, 2.]], threshold: 0.0456560105085373, right_val: 0.2866660058498383, left_val: 0.5069689154624939 }, { features: [[13, 7, 2, 2, -1.], [14, 7, 1, 1, 2.], [13, 8, 1, 1, 2.]], threshold: 1.2569549726322293e-003, right_val: 0.6318171024322510, left_val: 0.4846917092800140 }, { features: [[0, 12, 20, 6, -1.], [0, 14, 20, 2, 3.]], threshold: -0.1201507002115250, right_val: 0.4980959892272949, left_val: 0.0605261400341988 }, { features: [[14, 7, 2, 3, -1.], [14, 7, 1, 3, 2.]], threshold: -1.0533799650147557e-004, right_val: 0.4708042144775391, left_val: 0.5363109707832336 }, { features: [[0, 8, 9, 12, -1.], [3, 8, 3, 12, 3.]], threshold: -0.2070319056510925, right_val: 0.4979098141193390, left_val: 0.0596603304147720 }, { features: [[3, 0, 16, 2, -1.], [3, 0, 8, 2, 2.]], threshold: 1.2909180077258497e-004, right_val: 0.5377997756004334, left_val: 0.4712977111339569 }, { features: [[6, 15, 3, 3, -1.], [6, 16, 3, 1, 3.]], threshold: 3.8818528992123902e-004, right_val: 0.5534191131591797, left_val: 0.4363538026809692 }, { features: [[8, 15, 6, 3, -1.], [8, 16, 6, 1, 3.]], threshold: -2.9243610333651304e-003, right_val: 0.4825215935707092, left_val: 0.5811185836791992 }, { features: [[0, 10, 1, 6, -1.], [0, 12, 1, 2, 3.]], threshold: 8.3882332546636462e-004, right_val: 0.4038138985633850, left_val: 0.5311700105667114 }, { features: [[10, 9, 4, 3, -1.], [10, 10, 4, 1, 3.]], threshold: -1.9061550265178084e-003, right_val: 0.5260015130043030, left_val: 0.3770701885223389 }, { features: [[9, 15, 2, 3, -1.], [9, 16, 2, 1, 3.]], threshold: 8.9514348655939102e-003, right_val: 0.7682183980941773, left_val: 0.4766167998313904 }, { features: [[5, 7, 10, 1, -1.], [5, 7, 5, 1, 2.]], threshold: 0.0130834598094225, right_val: 0.3062222003936768, left_val: 0.5264462828636169 }, { features: [[4, 0, 12, 19, -1.], [10, 0, 6, 19, 2.]], threshold: -0.2115933001041412, right_val: 0.4695810079574585, left_val: 0.6737198233604431 }, { features: [[0, 6, 20, 6, -1.], [10, 6, 10, 3, 2.], [0, 9, 10, 3, 2.]], threshold: 3.1493250280618668e-003, right_val: 0.4386953115463257, left_val: 0.5644835233688355 }, { features: [[3, 6, 2, 2, -1.], [3, 6, 1, 1, 2.], [4, 7, 1, 1, 2.]], threshold: 3.9754100725986063e-004, right_val: 0.5895630121231079, left_val: 0.4526061117649078 }, { features: [[15, 6, 2, 2, -1.], [16, 6, 1, 1, 2.], [15, 7, 1, 1, 2.]], threshold: -1.3814480043947697e-003, right_val: 0.4942413866519928, left_val: 0.6070582270622253 }, { features: [[3, 6, 2, 2, -1.], [3, 6, 1, 1, 2.], [4, 7, 1, 1, 2.]], threshold: -5.8122188784182072e-004, right_val: 0.4508252143859863, left_val: 0.5998213291168213 }, { features: [[14, 4, 1, 12, -1.], [14, 10, 1, 6, 2.]], threshold: -2.3905329871922731e-003, right_val: 0.5223848223686218, left_val: 0.4205588996410370 }, { features: [[2, 5, 16, 10, -1.], [2, 5, 8, 5, 2.], [10, 10, 8, 5, 2.]], threshold: 0.0272689294070005, right_val: 0.3563301861286163, left_val: 0.5206447243690491 }, { features: [[9, 17, 3, 2, -1.], [10, 17, 1, 2, 3.]], threshold: -3.7658358924090862e-003, right_val: 0.5218814015388489, left_val: 0.3144704103469849 }, { features: [[1, 4, 2, 2, -1.], [1, 5, 2, 1, 2.]], threshold: -1.4903489500284195e-003, right_val: 0.5124437212944031, left_val: 0.3380196094512940 }, { features: [[5, 0, 15, 5, -1.], [10, 0, 5, 5, 3.]], threshold: -0.0174282304942608, right_val: 0.4919725954532623, left_val: 0.5829960703849793 }, { features: [[0, 0, 15, 5, -1.], [5, 0, 5, 5, 3.]], threshold: -0.0152780301868916, right_val: 0.4617887139320374, left_val: 0.6163144707679749 }, { features: [[11, 2, 2, 17, -1.], [11, 2, 1, 17, 2.]], threshold: 0.0319956094026566, right_val: 0.1712764054536820, left_val: 0.5166357159614563 }, { features: [[7, 2, 2, 17, -1.], [8, 2, 1, 17, 2.]], threshold: -3.8256710395216942e-003, right_val: 0.5131387710571289, left_val: 0.3408012092113495 }, { features: [[15, 11, 2, 9, -1.], [15, 11, 1, 9, 2.]], threshold: -8.5186436772346497e-003, right_val: 0.4997941851615906, left_val: 0.6105518937110901 }, { features: [[3, 11, 2, 9, -1.], [4, 11, 1, 9, 2.]], threshold: 9.0641621500253677e-004, right_val: 0.5582311153411865, left_val: 0.4327270984649658 }, { features: [[5, 16, 14, 4, -1.], [5, 16, 7, 4, 2.]], threshold: 0.0103448498994112, right_val: 0.5452420115470886, left_val: 0.4855653047561646 }], threshold: 69.2298736572265630 }, { simpleClassifiers: [{ features: [[1, 4, 18, 1, -1.], [7, 4, 6, 1, 3.]], threshold: 7.8981826081871986e-003, right_val: 0.5946462154388428, left_val: 0.3332524895668030 }, { features: [[13, 7, 6, 4, -1.], [16, 7, 3, 2, 2.], [13, 9, 3, 2, 2.]], threshold: 1.6170160379260778e-003, right_val: 0.5577868819236755, left_val: 0.3490641117095947 }, { features: [[9, 8, 2, 12, -1.], [9, 12, 2, 4, 3.]], threshold: -5.5449741194024682e-004, right_val: 0.3291530013084412, left_val: 0.5542566180229187 }, { features: [[12, 1, 6, 6, -1.], [12, 3, 6, 2, 3.]], threshold: 1.5428980113938451e-003, right_val: 0.5545979142189026, left_val: 0.3612579107284546 }, { features: [[5, 2, 6, 6, -1.], [5, 2, 3, 3, 2.], [8, 5, 3, 3, 2.]], threshold: -1.0329450014978647e-003, right_val: 0.5576140284538269, left_val: 0.3530139029026032 }, { features: [[9, 16, 6, 4, -1.], [12, 16, 3, 2, 2.], [9, 18, 3, 2, 2.]], threshold: 7.7698158565908670e-004, right_val: 0.5645321011543274, left_val: 0.3916778862476349 }, { features: [[1, 2, 18, 3, -1.], [7, 2, 6, 3, 3.]], threshold: 0.1432030051946640, right_val: 0.7023633122444153, left_val: 0.4667482078075409 }, { features: [[7, 4, 9, 10, -1.], [7, 9, 9, 5, 2.]], threshold: -7.3866490274667740e-003, right_val: 0.5289257764816284, left_val: 0.3073684871196747 }, { features: [[5, 9, 4, 4, -1.], [7, 9, 2, 4, 2.]], threshold: -6.2936742324382067e-004, right_val: 0.4037049114704132, left_val: 0.5622118115425110 }, { features: [[11, 10, 3, 6, -1.], [11, 13, 3, 3, 2.]], threshold: 7.8893528552725911e-004, right_val: 0.3557874858379364, left_val: 0.5267661213874817 }, { features: [[7, 11, 5, 3, -1.], [7, 12, 5, 1, 3.]], threshold: -0.0122280502691865, right_val: 0.4625549912452698, left_val: 0.6668320894241333 }, { features: [[7, 11, 6, 6, -1.], [10, 11, 3, 3, 2.], [7, 14, 3, 3, 2.]], threshold: 3.5420239437371492e-003, right_val: 0.3869673013687134, left_val: 0.5521438121795654 }, { features: [[0, 0, 10, 9, -1.], [0, 3, 10, 3, 3.]], threshold: -1.0585320414975286e-003, right_val: 0.5320926904678345, left_val: 0.3628678023815155 }, { features: [[13, 14, 1, 6, -1.], [13, 16, 1, 2, 3.]], threshold: 1.4935660146875307e-005, right_val: 0.5363323092460632, left_val: 0.4632444977760315 }, { features: [[0, 2, 3, 6, -1.], [0, 4, 3, 2, 3.]], threshold: 5.2537708543241024e-003, right_val: 0.3265708982944489, left_val: 0.5132231712341309 }, { features: [[8, 14, 4, 3, -1.], [8, 15, 4, 1, 3.]], threshold: -8.2338023930788040e-003, right_val: 0.4774140119552612, left_val: 0.6693689823150635 }, { features: [[6, 14, 1, 6, -1.], [6, 16, 1, 2, 3.]], threshold: 2.1866810129722580e-005, right_val: 0.5457931160926819, left_val: 0.4053862094879150 }, { features: [[9, 15, 2, 3, -1.], [9, 16, 2, 1, 3.]], threshold: -3.8150229956954718e-003, right_val: 0.4793178141117096, left_val: 0.6454995870590210 }, { features: [[6, 4, 3, 3, -1.], [7, 4, 1, 3, 3.]], threshold: 1.1105879675596952e-003, right_val: 0.3529678881168366, left_val: 0.5270407199859619 }, { features: [[9, 0, 11, 3, -1.], [9, 1, 11, 1, 3.]], threshold: -5.7707689702510834e-003, right_val: 0.5352957844734192, left_val: 0.3803547024726868 }, { features: [[0, 6, 20, 3, -1.], [0, 7, 20, 1, 3.]], threshold: -3.0158339068293571e-003, right_val: 0.3887133002281189, left_val: 0.5339403152465820 }, { features: [[10, 1, 1, 2, -1.], [10, 2, 1, 1, 2.]], threshold: -8.5453689098358154e-004, right_val: 0.5273603796958923, left_val: 0.3564616143703461 }, { features: [[9, 6, 2, 6, -1.], [10, 6, 1, 6, 2.]], threshold: 0.0110505102202296, right_val: 0.6849737763404846, left_val: 0.4671907126903534 }, { features: [[5, 8, 12, 1, -1.], [9, 8, 4, 1, 3.]], threshold: 0.0426058396697044, right_val: 0.0702200904488564, left_val: 0.5151473283767700 }, { features: [[3, 8, 12, 1, -1.], [7, 8, 4, 1, 3.]], threshold: -3.0781750101596117e-003, right_val: 0.5152602195739746, left_val: 0.3041661083698273 }, { features: [[9, 7, 3, 5, -1.], [10, 7, 1, 5, 3.]], threshold: -5.4815728217363358e-003, right_val: 0.4897229969501495, left_val: 0.6430295705795288 }, { features: [[3, 9, 6, 2, -1.], [6, 9, 3, 2, 2.]], threshold: 3.1881860923022032e-003, right_val: 0.3826209902763367, left_val: 0.5307493209838867 }, { features: [[12, 9, 3, 3, -1.], [12, 10, 3, 1, 3.]], threshold: 3.5947180003859103e-004, right_val: 0.5421904921531677, left_val: 0.4650047123432159 }, { features: [[7, 0, 6, 1, -1.], [9, 0, 2, 1, 3.]], threshold: -4.0705031715333462e-003, right_val: 0.5079116225242615, left_val: 0.2849679887294769 }, { features: [[12, 9, 3, 3, -1.], [12, 10, 3, 1, 3.]], threshold: -0.0145941702648997, right_val: 0.5128461718559265, left_val: 0.2971645891666412 }, { features: [[7, 10, 2, 1, -1.], [8, 10, 1, 1, 2.]], threshold: -1.1947689927183092e-004, right_val: 0.4343082010746002, left_val: 0.5631098151206970 }, { features: [[6, 4, 9, 13, -1.], [9, 4, 3, 13, 3.]], threshold: -6.9344649091362953e-004, right_val: 0.5359959006309509, left_val: 0.4403578042984009 }, { features: [[6, 8, 4, 2, -1.], [6, 9, 4, 1, 2.]], threshold: 1.4834799912932795e-005, right_val: 0.5164697766304016, left_val: 0.3421008884906769 }, { features: [[16, 2, 4, 6, -1.], [16, 2, 2, 6, 2.]], threshold: 9.0296985581517220e-003, right_val: 0.6114075183868408, left_val: 0.4639343023300171 }, { features: [[0, 17, 6, 3, -1.], [0, 18, 6, 1, 3.]], threshold: -8.0640818923711777e-003, right_val: 0.5075494050979614, left_val: 0.2820158898830414 }, { features: [[10, 10, 3, 10, -1.], [10, 15, 3, 5, 2.]], threshold: 0.0260621197521687, right_val: 0.2688778042793274, left_val: 0.5208905935287476 }, { features: [[8, 7, 3, 5, -1.], [9, 7, 1, 5, 3.]], threshold: 0.0173146594315767, right_val: 0.6738539934158325, left_val: 0.4663713872432709 }, { features: [[10, 4, 4, 3, -1.], [10, 4, 2, 3, 2.]], threshold: 0.0226666405797005, right_val: 0.2212723940610886, left_val: 0.5209349989891052 }, { features: [[8, 4, 3, 8, -1.], [9, 4, 1, 8, 3.]], threshold: -2.1965929772704840e-003, right_val: 0.4538190066814423, left_val: 0.6063101291656494 }, { features: [[6, 6, 9, 13, -1.], [9, 6, 3, 13, 3.]], threshold: -9.5282476395368576e-003, right_val: 0.5247430801391602, left_val: 0.4635204970836639 }, { features: [[6, 0, 8, 12, -1.], [6, 0, 4, 6, 2.], [10, 6, 4, 6, 2.]], threshold: 8.0943619832396507e-003, right_val: 0.3913882076740265, left_val: 0.5289440155029297 }, { features: [[14, 2, 6, 8, -1.], [16, 2, 2, 8, 3.]], threshold: -0.0728773325681686, right_val: 0.4990234971046448, left_val: 0.7752001881599426 }, { features: [[6, 0, 3, 6, -1.], [7, 0, 1, 6, 3.]], threshold: -6.9009521976113319e-003, right_val: 0.5048090219497681, left_val: 0.2428039014339447 }, { features: [[14, 2, 6, 8, -1.], [16, 2, 2, 8, 3.]], threshold: -0.0113082397729158, right_val: 0.4842376112937927, left_val: 0.5734364986419678 }, { features: [[0, 5, 6, 6, -1.], [0, 8, 6, 3, 2.]], threshold: 0.0596132017672062, right_val: 0.2524977028369904, left_val: 0.5029836297035217 }, { features: [[9, 12, 6, 2, -1.], [12, 12, 3, 1, 2.], [9, 13, 3, 1, 2.]], threshold: -2.8624620754271746e-003, right_val: 0.4898459911346436, left_val: 0.6073045134544373 }, { features: [[8, 17, 3, 2, -1.], [9, 17, 1, 2, 3.]], threshold: 4.4781449250876904e-003, right_val: 0.2220316976308823, left_val: 0.5015289187431335 }, { features: [[11, 6, 2, 2, -1.], [12, 6, 1, 1, 2.], [11, 7, 1, 1, 2.]], threshold: -1.7513240454718471e-003, right_val: 0.4933868944644928, left_val: 0.6614428758621216 }, { features: [[1, 9, 18, 2, -1.], [7, 9, 6, 2, 3.]], threshold: 0.0401634201407433, right_val: 0.3741044998168945, left_val: 0.5180878043174744 }, { features: [[11, 6, 2, 2, -1.], [12, 6, 1, 1, 2.], [11, 7, 1, 1, 2.]], threshold: 3.4768949262797832e-004, right_val: 0.5818032026290894, left_val: 0.4720416963100433 }, { features: [[3, 4, 12, 8, -1.], [7, 4, 4, 8, 3.]], threshold: 2.6551650371402502e-003, right_val: 0.5221335887908936, left_val: 0.3805010914802551 }, { features: [[13, 11, 5, 3, -1.], [13, 12, 5, 1, 3.]], threshold: -8.7706279009580612e-003, right_val: 0.5231295228004456, left_val: 0.2944166064262390 }, { features: [[9, 10, 2, 3, -1.], [9, 11, 2, 1, 3.]], threshold: -5.5122091434895992e-003, right_val: 0.4722816944122315, left_val: 0.7346177101135254 }, { features: [[14, 7, 2, 3, -1.], [14, 7, 1, 3, 2.]], threshold: 6.8672042107209563e-004, right_val: 0.4242413043975830, left_val: 0.5452876091003418 }, { features: [[5, 4, 1, 3, -1.], [5, 5, 1, 1, 3.]], threshold: 5.6019669864326715e-004, right_val: 0.5601285099983215, left_val: 0.4398862123489380 }, { features: [[13, 4, 2, 3, -1.], [13, 5, 2, 1, 3.]], threshold: 2.4143769405782223e-003, right_val: 0.6136621832847595, left_val: 0.4741686880588532 }, { features: [[5, 4, 2, 3, -1.], [5, 5, 2, 1, 3.]], threshold: -1.5680900542065501e-003, right_val: 0.4516409933567047, left_val: 0.6044552922248840 }, { features: [[9, 8, 2, 3, -1.], [9, 9, 2, 1, 3.]], threshold: -3.6827491130679846e-003, right_val: 0.5294982194900513, left_val: 0.2452459037303925 }, { features: [[8, 9, 2, 2, -1.], [8, 10, 2, 1, 2.]], threshold: -2.9409190756268799e-004, right_val: 0.5251451134681702, left_val: 0.3732838034629822 }, { features: [[15, 14, 1, 4, -1.], [15, 16, 1, 2, 2.]], threshold: 4.2847759323194623e-004, right_val: 0.4065535068511963, left_val: 0.5498809814453125 }, { features: [[3, 12, 2, 2, -1.], [3, 13, 2, 1, 2.]], threshold: -4.8817070201039314e-003, right_val: 0.4999957084655762, left_val: 0.2139908969402313 }, { features: [[12, 15, 2, 2, -1.], [13, 15, 1, 1, 2.], [12, 16, 1, 1, 2.]], threshold: 2.7272020815871656e-004, right_val: 0.5813428759574890, left_val: 0.4650287032127380 }, { features: [[9, 13, 2, 2, -1.], [9, 14, 2, 1, 2.]], threshold: 2.0947199664078653e-004, right_val: 0.5572792887687683, left_val: 0.4387486875057221 }, { features: [[4, 11, 14, 9, -1.], [4, 14, 14, 3, 3.]], threshold: 0.0485011897981167, right_val: 0.3212889134883881, left_val: 0.5244972705841065 }, { features: [[7, 13, 4, 3, -1.], [7, 14, 4, 1, 3.]], threshold: -4.5166411437094212e-003, right_val: 0.4545882046222687, left_val: 0.6056813001632690 }, { features: [[15, 14, 1, 4, -1.], [15, 16, 1, 2, 2.]], threshold: -0.0122916800901294, right_val: 0.5152214169502258, left_val: 0.2040929049253464 }, { features: [[4, 14, 1, 4, -1.], [4, 16, 1, 2, 2.]], threshold: 4.8549679922871292e-004, right_val: 0.3739503026008606, left_val: 0.5237604975700378 }, { features: [[14, 0, 6, 13, -1.], [16, 0, 2, 13, 3.]], threshold: 0.0305560491979122, right_val: 0.5938246250152588, left_val: 0.4960533976554871 }, { features: [[4, 1, 2, 12, -1.], [4, 1, 1, 6, 2.], [5, 7, 1, 6, 2.]], threshold: -1.5105320198927075e-004, right_val: 0.4145204126834869, left_val: 0.5351303815841675 }, { features: [[11, 14, 6, 6, -1.], [14, 14, 3, 3, 2.], [11, 17, 3, 3, 2.]], threshold: 2.4937440175563097e-003, right_val: 0.5514941215515137, left_val: 0.4693366885185242 }, { features: [[3, 14, 6, 6, -1.], [3, 14, 3, 3, 2.], [6, 17, 3, 3, 2.]], threshold: -0.0123821301385760, right_val: 0.4681667983531952, left_val: 0.6791396737098694 }, { features: [[14, 17, 3, 2, -1.], [14, 18, 3, 1, 2.]], threshold: -5.1333461888134480e-003, right_val: 0.5229160189628601, left_val: 0.3608739078044891 }, { features: [[3, 17, 3, 2, -1.], [3, 18, 3, 1, 2.]], threshold: 5.1919277757406235e-004, right_val: 0.3633613884449005, left_val: 0.5300073027610779 }, { features: [[14, 0, 6, 13, -1.], [16, 0, 2, 13, 3.]], threshold: 0.1506042033433914, right_val: 0.2211782038211823, left_val: 0.5157316923141480 }, { features: [[0, 0, 6, 13, -1.], [2, 0, 2, 13, 3.]], threshold: 7.7144149690866470e-003, right_val: 0.5776609182357788, left_val: 0.4410496950149536 }, { features: [[10, 10, 7, 6, -1.], [10, 12, 7, 2, 3.]], threshold: 9.4443522393703461e-003, right_val: 0.3756650090217590, left_val: 0.5401855111122131 }, { features: [[6, 15, 2, 2, -1.], [6, 15, 1, 1, 2.], [7, 16, 1, 1, 2.]], threshold: 2.5006249779835343e-004, right_val: 0.5607374906539917, left_val: 0.4368270933628082 }, { features: [[6, 11, 8, 6, -1.], [10, 11, 4, 3, 2.], [6, 14, 4, 3, 2.]], threshold: -3.3077150583267212e-003, right_val: 0.5518230795860291, left_val: 0.4244799017906189 }, { features: [[7, 6, 2, 2, -1.], [7, 6, 1, 1, 2.], [8, 7, 1, 1, 2.]], threshold: 7.4048910755664110e-004, right_val: 0.5900576710700989, left_val: 0.4496962130069733 }, { features: [[2, 2, 16, 6, -1.], [10, 2, 8, 3, 2.], [2, 5, 8, 3, 2.]], threshold: 0.0440920516848564, right_val: 0.3156355023384094, left_val: 0.5293493270874023 }, { features: [[5, 4, 3, 3, -1.], [5, 5, 3, 1, 3.]], threshold: 3.3639909233897924e-003, right_val: 0.5848662257194519, left_val: 0.4483296871185303 }, { features: [[11, 7, 3, 10, -1.], [11, 12, 3, 5, 2.]], threshold: -3.9760079234838486e-003, right_val: 0.5483639240264893, left_val: 0.4559507071971893 }, { features: [[6, 7, 3, 10, -1.], [6, 12, 3, 5, 2.]], threshold: 2.7716930489987135e-003, right_val: 0.3792484104633331, left_val: 0.5341786146163940 }, { features: [[10, 7, 3, 2, -1.], [11, 7, 1, 2, 3.]], threshold: -2.4123019829858094e-004, right_val: 0.4576973021030426, left_val: 0.5667188763618469 }, { features: [[8, 12, 4, 2, -1.], [8, 13, 4, 1, 2.]], threshold: 4.9425667384639382e-004, right_val: 0.5628787279129028, left_val: 0.4421244859695435 }, { features: [[10, 1, 1, 3, -1.], [10, 2, 1, 1, 3.]], threshold: -3.8876468897797167e-004, right_val: 0.5391063094139099, left_val: 0.4288370907306671 }, { features: [[1, 2, 4, 18, -1.], [1, 2, 2, 9, 2.], [3, 11, 2, 9, 2.]], threshold: -0.0500488989055157, right_val: 0.4703742861747742, left_val: 0.6899513006210327 }, { features: [[12, 4, 4, 12, -1.], [12, 10, 4, 6, 2.]], threshold: -0.0366354808211327, right_val: 0.5191826224327087, left_val: 0.2217779010534287 }, { features: [[0, 0, 1, 6, -1.], [0, 2, 1, 2, 3.]], threshold: 2.4273579474538565e-003, right_val: 0.3497397899627686, left_val: 0.5136224031448364 }, { features: [[9, 11, 2, 3, -1.], [9, 12, 2, 1, 3.]], threshold: 1.9558030180633068e-003, right_val: 0.6408380866050720, left_val: 0.4826192855834961 }, { features: [[8, 7, 4, 3, -1.], [8, 8, 4, 1, 3.]], threshold: -1.7494610510766506e-003, right_val: 0.5272685289382935, left_val: 0.3922835886478424 }, { features: [[10, 7, 3, 2, -1.], [11, 7, 1, 2, 3.]], threshold: 0.0139550799503922, right_val: 0.8416504859924316, left_val: 0.5078201889991760 }, { features: [[7, 7, 3, 2, -1.], [8, 7, 1, 2, 3.]], threshold: -2.1896739781368524e-004, right_val: 0.4314234852790833, left_val: 0.5520489811897278 }, { features: [[9, 4, 6, 1, -1.], [11, 4, 2, 1, 3.]], threshold: -1.5131309628486633e-003, right_val: 0.5382571220397949, left_val: 0.3934605121612549 }, { features: [[8, 7, 2, 3, -1.], [9, 7, 1, 3, 2.]], threshold: -4.3622800149023533e-003, right_val: 0.4736475944519043, left_val: 0.7370628714561462 }, { features: [[12, 7, 8, 6, -1.], [16, 7, 4, 3, 2.], [12, 10, 4, 3, 2.]], threshold: 0.0651605874300003, right_val: 0.3281595110893250, left_val: 0.5159279704093933 }, { features: [[0, 7, 8, 6, -1.], [0, 7, 4, 3, 2.], [4, 10, 4, 3, 2.]], threshold: -2.3567399475723505e-003, right_val: 0.5172886252403259, left_val: 0.3672826886177063 }, { features: [[18, 2, 2, 10, -1.], [19, 2, 1, 5, 2.], [18, 7, 1, 5, 2.]], threshold: 0.0151466596871614, right_val: 0.6687604188919067, left_val: 0.5031493902206421 }, { features: [[0, 2, 6, 4, -1.], [3, 2, 3, 4, 2.]], threshold: -0.0228509604930878, right_val: 0.4709596931934357, left_val: 0.6767519712448120 }, { features: [[9, 4, 6, 1, -1.], [11, 4, 2, 1, 3.]], threshold: 4.8867650330066681e-003, right_val: 0.4059878885746002, left_val: 0.5257998108863831 }, { features: [[7, 15, 2, 2, -1.], [7, 15, 1, 1, 2.], [8, 16, 1, 1, 2.]], threshold: 1.7619599821045995e-003, right_val: 0.6688278913497925, left_val: 0.4696272909641266 }, { features: [[11, 13, 1, 6, -1.], [11, 16, 1, 3, 2.]], threshold: -1.2942519970238209e-003, right_val: 0.5344281792640686, left_val: 0.4320712983608246 }, { features: [[8, 13, 1, 6, -1.], [8, 16, 1, 3, 2.]], threshold: 0.0109299495816231, right_val: 0.1637486070394516, left_val: 0.4997706115245819 }, { features: [[14, 3, 2, 1, -1.], [14, 3, 1, 1, 2.]], threshold: 2.9958489903947338e-005, right_val: 0.5633224248886108, left_val: 0.4282417893409729 }, { features: [[8, 15, 2, 3, -1.], [8, 16, 2, 1, 3.]], threshold: -6.5884361974895000e-003, right_val: 0.4700526893138886, left_val: 0.6772121191024780 }, { features: [[12, 15, 7, 4, -1.], [12, 17, 7, 2, 2.]], threshold: 3.2527779694646597e-003, right_val: 0.4536148905754089, left_val: 0.5313397049903870 }, { features: [[4, 14, 12, 3, -1.], [4, 15, 12, 1, 3.]], threshold: -4.0435739792883396e-003, right_val: 0.4413388967514038, left_val: 0.5660061836242676 }, { features: [[10, 3, 3, 2, -1.], [11, 3, 1, 2, 3.]], threshold: -1.2523540062829852e-003, right_val: 0.5356451869010925, left_val: 0.3731913864612579 }, { features: [[4, 12, 2, 2, -1.], [4, 13, 2, 1, 2.]], threshold: 1.9246719602961093e-004, right_val: 0.3738811016082764, left_val: 0.5189986228942871 }, { features: [[10, 11, 4, 6, -1.], [10, 14, 4, 3, 2.]], threshold: -0.0385896712541580, right_val: 0.5188810825347900, left_val: 0.2956373989582062 }, { features: [[7, 13, 2, 2, -1.], [7, 13, 1, 1, 2.], [8, 14, 1, 1, 2.]], threshold: 1.5489870565943420e-004, right_val: 0.5509533286094666, left_val: 0.4347135126590729 }, { features: [[4, 11, 14, 4, -1.], [11, 11, 7, 2, 2.], [4, 13, 7, 2, 2.]], threshold: -0.0337638482451439, right_val: 0.5195475816726685, left_val: 0.3230330049991608 }, { features: [[1, 18, 18, 2, -1.], [7, 18, 6, 2, 3.]], threshold: -8.2657067105174065e-003, right_val: 0.4552114009857178, left_val: 0.5975489020347595 }, { features: [[11, 18, 2, 2, -1.], [12, 18, 1, 1, 2.], [11, 19, 1, 1, 2.]], threshold: 1.4481440302915871e-005, right_val: 0.5497426986694336, left_val: 0.4745678007602692 }, { features: [[7, 18, 2, 2, -1.], [7, 18, 1, 1, 2.], [8, 19, 1, 1, 2.]], threshold: 1.4951299817766994e-005, right_val: 0.5480644106864929, left_val: 0.4324473142623901 }, { features: [[12, 18, 8, 2, -1.], [12, 19, 8, 1, 2.]], threshold: -0.0187417995184660, right_val: 0.5178533196449280, left_val: 0.1580052971839905 }, { features: [[7, 14, 6, 2, -1.], [7, 15, 6, 1, 2.]], threshold: 1.7572239739820361e-003, right_val: 0.5773764252662659, left_val: 0.4517636895179749 }, { features: [[8, 12, 4, 8, -1.], [10, 12, 2, 4, 2.], [8, 16, 2, 4, 2.]], threshold: -3.1391119118779898e-003, right_val: 0.5460842251777649, left_val: 0.4149647951126099 }, { features: [[4, 9, 3, 3, -1.], [4, 10, 3, 1, 3.]], threshold: 6.6656779381446540e-005, right_val: 0.5293084979057312, left_val: 0.4039090871810913 }, { features: [[7, 10, 6, 2, -1.], [9, 10, 2, 2, 3.]], threshold: 6.7743421532213688e-003, right_val: 0.6121956110000610, left_val: 0.4767651855945587 }, { features: [[5, 0, 4, 15, -1.], [7, 0, 2, 15, 2.]], threshold: -7.3868161998689175e-003, right_val: 0.5187280774116516, left_val: 0.3586258888244629 }, { features: [[8, 6, 12, 14, -1.], [12, 6, 4, 14, 3.]], threshold: 0.0140409301966429, right_val: 0.5576155781745911, left_val: 0.4712139964103699 }, { features: [[5, 16, 3, 3, -1.], [5, 17, 3, 1, 3.]], threshold: -5.5258329957723618e-003, right_val: 0.5039281249046326, left_val: 0.2661027014255524 }, { features: [[8, 1, 12, 19, -1.], [12, 1, 4, 19, 3.]], threshold: 0.3868423998355866, right_val: 0.2525899112224579, left_val: 0.5144339799880981 }, { features: [[3, 0, 3, 2, -1.], [3, 1, 3, 1, 2.]], threshold: 1.1459240340627730e-004, right_val: 0.5423371195793152, left_val: 0.4284994900226593 }, { features: [[10, 12, 4, 5, -1.], [10, 12, 2, 5, 2.]], threshold: -0.0184675697237253, right_val: 0.5213062167167664, left_val: 0.3885835111141205 }, { features: [[6, 12, 4, 5, -1.], [8, 12, 2, 5, 2.]], threshold: -4.5907011372037232e-004, right_val: 0.4235909879207611, left_val: 0.5412563085556030 }, { features: [[11, 11, 2, 2, -1.], [12, 11, 1, 1, 2.], [11, 12, 1, 1, 2.]], threshold: 1.2527540093287826e-003, right_val: 0.6624091267585754, left_val: 0.4899305105209351 }, { features: [[0, 2, 3, 6, -1.], [0, 4, 3, 2, 3.]], threshold: 1.4910609461367130e-003, right_val: 0.4040051996707916, left_val: 0.5286778211593628 }, { features: [[11, 11, 2, 2, -1.], [12, 11, 1, 1, 2.], [11, 12, 1, 1, 2.]], threshold: -7.5435562757775187e-004, right_val: 0.4795120060443878, left_val: 0.6032990217208862 }, { features: [[7, 6, 4, 10, -1.], [7, 11, 4, 5, 2.]], threshold: -6.9478838704526424e-003, right_val: 0.5373504161834717, left_val: 0.4084401130676270 }, { features: [[11, 11, 2, 2, -1.], [12, 11, 1, 1, 2.], [11, 12, 1, 1, 2.]], threshold: 2.8092920547351241e-004, right_val: 0.5759382247924805, left_val: 0.4846062958240509 }, { features: [[2, 13, 5, 2, -1.], [2, 14, 5, 1, 2.]], threshold: 9.6073717577382922e-004, right_val: 0.3554979860782623, left_val: 0.5164741277694702 }, { features: [[11, 11, 2, 2, -1.], [12, 11, 1, 1, 2.], [11, 12, 1, 1, 2.]], threshold: -2.6883929967880249e-004, right_val: 0.4731765985488892, left_val: 0.5677582025527954 }, { features: [[7, 11, 2, 2, -1.], [7, 11, 1, 1, 2.], [8, 12, 1, 1, 2.]], threshold: 2.1599370520561934e-003, right_val: 0.7070567011833191, left_val: 0.4731487035751343 }, { features: [[14, 13, 3, 3, -1.], [14, 14, 3, 1, 3.]], threshold: 5.6235301308333874e-003, right_val: 0.2781791985034943, left_val: 0.5240243077278137 }, { features: [[3, 13, 3, 3, -1.], [3, 14, 3, 1, 3.]], threshold: -5.0243991427123547e-003, right_val: 0.5062304139137268, left_val: 0.2837013900279999 }, { features: [[9, 14, 2, 3, -1.], [9, 15, 2, 1, 3.]], threshold: -9.7611639648675919e-003, right_val: 0.4934569001197815, left_val: 0.7400717735290527 }, { features: [[8, 7, 3, 3, -1.], [8, 8, 3, 1, 3.]], threshold: 4.1515100747346878e-003, right_val: 0.3407008051872253, left_val: 0.5119131207466126 }, { features: [[13, 5, 3, 3, -1.], [13, 6, 3, 1, 3.]], threshold: 6.2465080991387367e-003, right_val: 0.6579058766365051, left_val: 0.4923788011074066 }, { features: [[0, 9, 5, 3, -1.], [0, 10, 5, 1, 3.]], threshold: -7.0597478188574314e-003, right_val: 0.5032842159271240, left_val: 0.2434711009263992 }, { features: [[13, 5, 3, 3, -1.], [13, 6, 3, 1, 3.]], threshold: -2.0587709732353687e-003, right_val: 0.4695087075233460, left_val: 0.5900310873985291 }, { features: [[9, 12, 2, 8, -1.], [9, 12, 1, 4, 2.], [10, 16, 1, 4, 2.]], threshold: -2.4146060459315777e-003, right_val: 0.5189201831817627, left_val: 0.3647317886352539 }, { features: [[11, 7, 2, 2, -1.], [12, 7, 1, 1, 2.], [11, 8, 1, 1, 2.]], threshold: -1.4817609917372465e-003, right_val: 0.4940128028392792, left_val: 0.6034948229789734 }, { features: [[0, 16, 6, 4, -1.], [3, 16, 3, 4, 2.]], threshold: -6.3016400672495365e-003, right_val: 0.4560427963733673, left_val: 0.5818989872932434 }, { features: [[10, 6, 2, 3, -1.], [10, 7, 2, 1, 3.]], threshold: 3.4763428848236799e-003, right_val: 0.3483993113040924, left_val: 0.5217475891113281 }, { features: [[9, 5, 2, 6, -1.], [9, 7, 2, 2, 3.]], threshold: -0.0222508702427149, right_val: 0.5032082796096802, left_val: 0.2360700070858002 }, { features: [[12, 15, 8, 4, -1.], [12, 15, 4, 4, 2.]], threshold: -0.0306125506758690, right_val: 0.4914919137954712, left_val: 0.6499186754226685 }, { features: [[0, 14, 8, 6, -1.], [4, 14, 4, 6, 2.]], threshold: 0.0130574796348810, right_val: 0.5683764219284058, left_val: 0.4413323104381561 }, { features: [[9, 0, 3, 2, -1.], [10, 0, 1, 2, 3.]], threshold: -6.0095742810517550e-004, right_val: 0.5333483219146729, left_val: 0.4359731078147888 }, { features: [[4, 15, 4, 2, -1.], [6, 15, 2, 2, 2.]], threshold: -4.1514250915497541e-004, right_val: 0.4326060116291046, left_val: 0.5504062771797180 }, { features: [[12, 7, 3, 13, -1.], [13, 7, 1, 13, 3.]], threshold: -0.0137762902304530, right_val: 0.5201548933982849, left_val: 0.4064112901687622 }, { features: [[5, 7, 3, 13, -1.], [6, 7, 1, 13, 3.]], threshold: -0.0322965085506439, right_val: 0.4977194964885712, left_val: 0.0473519712686539 }, { features: [[9, 6, 3, 9, -1.], [9, 9, 3, 3, 3.]], threshold: 0.0535569787025452, right_val: 0.6666939258575440, left_val: 0.4881733059883118 }, { features: [[4, 4, 7, 12, -1.], [4, 10, 7, 6, 2.]], threshold: 8.1889545544981956e-003, right_val: 0.4240820109844208, left_val: 0.5400037169456482 }, { features: [[12, 12, 2, 2, -1.], [13, 12, 1, 1, 2.], [12, 13, 1, 1, 2.]], threshold: 2.1055320394225419e-004, right_val: 0.5563852787017822, left_val: 0.4802047908306122 }, { features: [[6, 12, 2, 2, -1.], [6, 12, 1, 1, 2.], [7, 13, 1, 1, 2.]], threshold: -2.4382730480283499e-003, right_val: 0.4773685038089752, left_val: 0.7387793064117432 }, { features: [[8, 9, 4, 2, -1.], [10, 9, 2, 1, 2.], [8, 10, 2, 1, 2.]], threshold: 3.2835570164024830e-003, right_val: 0.3171291947364807, left_val: 0.5288546085357666 }, { features: [[3, 6, 2, 2, -1.], [3, 6, 1, 1, 2.], [4, 7, 1, 1, 2.]], threshold: 2.3729570675641298e-003, right_val: 0.7060170769691467, left_val: 0.4750812947750092 }, { features: [[16, 6, 3, 2, -1.], [16, 7, 3, 1, 2.]], threshold: -1.4541699783876538e-003, right_val: 0.5330739021301270, left_val: 0.3811730146408081 }], threshold: 79.2490768432617190 }, { simpleClassifiers: [{ features: [[0, 7, 19, 4, -1.], [0, 9, 19, 2, 2.]], threshold: 0.0557552389800549, right_val: 0.6806036829948425, left_val: 0.4019156992435455 }, { features: [[10, 2, 10, 1, -1.], [10, 2, 5, 1, 2.]], threshold: 2.4730248842388391e-003, right_val: 0.5965719819068909, left_val: 0.3351148962974548 }, { features: [[9, 4, 2, 12, -1.], [9, 10, 2, 6, 2.]], threshold: -3.5031698644161224e-004, right_val: 0.3482286930084229, left_val: 0.5557708144187927 }, { features: [[12, 18, 4, 1, -1.], [12, 18, 2, 1, 2.]], threshold: 5.4167630150914192e-004, right_val: 0.5693380832672119, left_val: 0.4260858893394470 }, { features: [[1, 7, 6, 4, -1.], [1, 7, 3, 2, 2.], [4, 9, 3, 2, 2.]], threshold: 7.7193678589537740e-004, right_val: 0.5433688759803772, left_val: 0.3494240045547485 }, { features: [[12, 0, 6, 13, -1.], [14, 0, 2, 13, 3.]], threshold: -1.5999219613149762e-003, right_val: 0.5484359264373779, left_val: 0.4028499126434326 }, { features: [[2, 0, 6, 13, -1.], [4, 0, 2, 13, 3.]], threshold: -1.1832080053864047e-004, right_val: 0.5425465106964111, left_val: 0.3806901872158051 }, { features: [[10, 5, 8, 8, -1.], [10, 9, 8, 4, 2.]], threshold: 3.2909031142480671e-004, right_val: 0.5429521799087524, left_val: 0.2620100080966950 }, { features: [[8, 3, 2, 5, -1.], [9, 3, 1, 5, 2.]], threshold: 2.9518108931370080e-004, right_val: 0.5399264097213745, left_val: 0.3799768984317780 }, { features: [[8, 4, 9, 1, -1.], [11, 4, 3, 1, 3.]], threshold: 9.0466710389591753e-005, right_val: 0.5440226197242737, left_val: 0.4433645009994507 }, { features: [[3, 4, 9, 1, -1.], [6, 4, 3, 1, 3.]], threshold: 1.5007190086180344e-005, right_val: 0.5409119725227356, left_val: 0.3719654977321625 }, { features: [[1, 0, 18, 10, -1.], [7, 0, 6, 10, 3.]], threshold: 0.1393561065196991, right_val: 0.4479042887687683, left_val: 0.5525395870208740 }, { features: [[7, 17, 5, 3, -1.], [7, 18, 5, 1, 3.]], threshold: 1.6461990308016539e-003, right_val: 0.5772169828414917, left_val: 0.4264501035213471 }, { features: [[7, 11, 6, 1, -1.], [9, 11, 2, 1, 3.]], threshold: 4.9984431825578213e-004, right_val: 0.5685871243476868, left_val: 0.4359526038169861 }, { features: [[2, 2, 3, 2, -1.], [2, 3, 3, 1, 2.]], threshold: -1.0971280280500650e-003, right_val: 0.5205408930778503, left_val: 0.3390136957168579 }, { features: [[8, 12, 4, 2, -1.], [8, 13, 4, 1, 2.]], threshold: 6.6919892560690641e-004, right_val: 0.5980659723281860, left_val: 0.4557456076145172 }, { features: [[6, 10, 3, 6, -1.], [6, 13, 3, 3, 2.]], threshold: 8.6471042595803738e-004, right_val: 0.2944033145904541, left_val: 0.5134841203689575 }, { features: [[11, 4, 2, 4, -1.], [11, 4, 1, 4, 2.]], threshold: -2.7182599296793342e-004, right_val: 0.5377181172370911, left_val: 0.3906578123569489 }, { features: [[7, 4, 2, 4, -1.], [8, 4, 1, 4, 2.]], threshold: 3.0249499104684219e-005, right_val: 0.5225688815116882, left_val: 0.3679609894752502 }, { features: [[9, 6, 2, 4, -1.], [9, 6, 1, 4, 2.]], threshold: -8.5225896909832954e-003, right_val: 0.4892365038394928, left_val: 0.7293102145195007 }, { features: [[6, 13, 8, 3, -1.], [6, 14, 8, 1, 3.]], threshold: 1.6705560265108943e-003, right_val: 0.5696138143539429, left_val: 0.4345324933528900 }, { features: [[9, 15, 3, 4, -1.], [10, 15, 1, 4, 3.]], threshold: -7.1433838456869125e-003, right_val: 0.5225623846054077, left_val: 0.2591280043125153 }, { features: [[9, 2, 2, 17, -1.], [10, 2, 1, 17, 2.]], threshold: -0.0163193698972464, right_val: 0.4651575982570648, left_val: 0.6922279000282288 }, { features: [[7, 0, 6, 1, -1.], [9, 0, 2, 1, 3.]], threshold: 4.8034260980784893e-003, right_val: 0.3286302983760834, left_val: 0.5352262854576111 }, { features: [[8, 15, 3, 4, -1.], [9, 15, 1, 4, 3.]], threshold: -7.5421929359436035e-003, right_val: 0.5034546256065369, left_val: 0.2040544003248215 }, { features: [[7, 13, 7, 3, -1.], [7, 14, 7, 1, 3.]], threshold: -0.0143631100654602, right_val: 0.4889059066772461, left_val: 0.6804888844490051 }, { features: [[8, 16, 3, 3, -1.], [9, 16, 1, 3, 3.]], threshold: 8.9063588529825211e-004, right_val: 0.3895480930805206, left_val: 0.5310695767402649 }, { features: [[6, 2, 8, 10, -1.], [6, 7, 8, 5, 2.]], threshold: -4.4060191139578819e-003, right_val: 0.4372426867485046, left_val: 0.5741562843322754 }, { features: [[2, 5, 8, 8, -1.], [2, 9, 8, 4, 2.]], threshold: -1.8862540309783071e-004, right_val: 0.5098205208778381, left_val: 0.2831785976886749 }, { features: [[14, 16, 2, 2, -1.], [14, 17, 2, 1, 2.]], threshold: -3.7979281041771173e-003, right_val: 0.5246580243110657, left_val: 0.3372507989406586 }, { features: [[4, 16, 2, 2, -1.], [4, 17, 2, 1, 2.]], threshold: 1.4627049677073956e-004, right_val: 0.3911710083484650, left_val: 0.5306674242019653 }, { features: [[10, 11, 4, 6, -1.], [10, 14, 4, 3, 2.]], threshold: -4.9164638767251745e-005, right_val: 0.3942720890045166, left_val: 0.5462496280670166 }, { features: [[6, 11, 4, 6, -1.], [6, 14, 4, 3, 2.]], threshold: -0.0335825011134148, right_val: 0.5048211812973023, left_val: 0.2157824039459229 }, { features: [[10, 14, 1, 3, -1.], [10, 15, 1, 1, 3.]], threshold: -3.5339309833943844e-003, right_val: 0.4872696995735169, left_val: 0.6465312242507935 }, { features: [[8, 14, 4, 3, -1.], [8, 15, 4, 1, 3.]], threshold: 5.0144111737608910e-003, right_val: 0.6248074769973755, left_val: 0.4617668092250824 }, { features: [[10, 0, 4, 6, -1.], [12, 0, 2, 3, 2.], [10, 3, 2, 3, 2.]], threshold: 0.0188173707574606, right_val: 0.2000052034854889, left_val: 0.5220689177513123 }, { features: [[0, 3, 20, 2, -1.], [0, 4, 20, 1, 2.]], threshold: -1.3434339780360460e-003, right_val: 0.5301619768142700, left_val: 0.4014537930488586 }, { features: [[12, 0, 8, 2, -1.], [16, 0, 4, 1, 2.], [12, 1, 4, 1, 2.]], threshold: 1.7557960236445069e-003, right_val: 0.5653169751167297, left_val: 0.4794039130210877 }, { features: [[2, 12, 10, 8, -1.], [2, 16, 10, 4, 2.]], threshold: -0.0956374630331993, right_val: 0.5006706714630127, left_val: 0.2034195065498352 }, { features: [[17, 7, 2, 10, -1.], [18, 7, 1, 5, 2.], [17, 12, 1, 5, 2.]], threshold: -0.0222412291914225, right_val: 0.5046340227127075, left_val: 0.7672473192214966 }, { features: [[1, 7, 2, 10, -1.], [1, 7, 1, 5, 2.], [2, 12, 1, 5, 2.]], threshold: -0.0155758196488023, right_val: 0.4755851030349731, left_val: 0.7490342259407044 }, { features: [[15, 10, 3, 6, -1.], [15, 12, 3, 2, 3.]], threshold: 5.3599118255078793e-003, right_val: 0.4004670977592468, left_val: 0.5365303754806519 }, { features: [[4, 4, 6, 2, -1.], [6, 4, 2, 2, 3.]], threshold: -0.0217634998261929, right_val: 0.4964174926280975, left_val: 0.0740154981613159 }, { features: [[0, 5, 20, 6, -1.], [0, 7, 20, 2, 3.]], threshold: -0.1656159013509750, right_val: 0.5218086242675781, left_val: 0.2859103083610535 }, { features: [[0, 0, 8, 2, -1.], [0, 0, 4, 1, 2.], [4, 1, 4, 1, 2.]], threshold: 1.6461320046801120e-004, right_val: 0.5380793213844299, left_val: 0.4191615879535675 }, { features: [[1, 0, 18, 4, -1.], [7, 0, 6, 4, 3.]], threshold: -8.9077502489089966e-003, right_val: 0.4877404868602753, left_val: 0.6273192763328552 }, { features: [[1, 13, 6, 2, -1.], [1, 14, 6, 1, 2.]], threshold: 8.6346449097618461e-004, right_val: 0.3671025931835175, left_val: 0.5159940719604492 }, { features: [[10, 8, 3, 4, -1.], [11, 8, 1, 4, 3.]], threshold: -1.3751760125160217e-003, right_val: 0.4579083919525147, left_val: 0.5884376764297485 }, { features: [[6, 1, 6, 1, -1.], [8, 1, 2, 1, 3.]], threshold: -1.4081239933148026e-003, right_val: 0.5139945149421692, left_val: 0.3560509979724884 }, { features: [[8, 14, 4, 3, -1.], [8, 15, 4, 1, 3.]], threshold: -3.9342888630926609e-003, right_val: 0.4664272069931030, left_val: 0.5994288921356201 }, { features: [[1, 6, 18, 2, -1.], [10, 6, 9, 2, 2.]], threshold: -0.0319669283926487, right_val: 0.5144183039665222, left_val: 0.3345462083816528 }, { features: [[15, 11, 1, 2, -1.], [15, 12, 1, 1, 2.]], threshold: -1.5089280168467667e-005, right_val: 0.4414057135581970, left_val: 0.5582656264305115 }, { features: [[6, 5, 1, 2, -1.], [6, 6, 1, 1, 2.]], threshold: 5.1994470413774252e-004, right_val: 0.6168993711471558, left_val: 0.4623680114746094 }, { features: [[13, 4, 1, 3, -1.], [13, 5, 1, 1, 3.]], threshold: -3.4220460802316666e-003, right_val: 0.4974805116653442, left_val: 0.6557074785232544 }, { features: [[2, 15, 1, 2, -1.], [2, 16, 1, 1, 2.]], threshold: 1.7723299970384687e-004, right_val: 0.3901908099651337, left_val: 0.5269501805305481 }, { features: [[12, 4, 4, 3, -1.], [12, 5, 4, 1, 3.]], threshold: 1.5716759953647852e-003, right_val: 0.5790457725524902, left_val: 0.4633373022079468 }, { features: [[0, 0, 7, 3, -1.], [0, 1, 7, 1, 3.]], threshold: -8.9041329920291901e-003, right_val: 0.5053591132164002, left_val: 0.2689608037471771 }, { features: [[9, 12, 6, 2, -1.], [9, 12, 3, 2, 2.]], threshold: 4.0677518700249493e-004, right_val: 0.4329898953437805, left_val: 0.5456603169441223 }, { features: [[5, 4, 2, 3, -1.], [5, 5, 2, 1, 3.]], threshold: 6.7604780197143555e-003, right_val: 0.6689761877059937, left_val: 0.4648993909358978 }, { features: [[18, 4, 2, 3, -1.], [18, 5, 2, 1, 3.]], threshold: 2.9100088868290186e-003, right_val: 0.3377839922904968, left_val: 0.5309703946113586 }, { features: [[3, 0, 8, 6, -1.], [3, 2, 8, 2, 3.]], threshold: 1.3885459629818797e-003, right_val: 0.5349133014678955, left_val: 0.4074738919734955 }, { features: [[0, 2, 20, 6, -1.], [10, 2, 10, 3, 2.], [0, 5, 10, 3, 2.]], threshold: -0.0767642632126808, right_val: 0.5228242278099060, left_val: 0.1992176026105881 }, { features: [[4, 7, 2, 4, -1.], [5, 7, 1, 4, 2.]], threshold: -2.2688310127705336e-004, right_val: 0.4253072142601013, left_val: 0.5438501834869385 }, { features: [[3, 10, 15, 2, -1.], [8, 10, 5, 2, 3.]], threshold: -6.3094152137637138e-003, right_val: 0.5378909707069397, left_val: 0.4259178936481476 }, { features: [[3, 0, 12, 11, -1.], [9, 0, 6, 11, 2.]], threshold: -0.1100727990269661, right_val: 0.4721749126911163, left_val: 0.6904156804084778 }, { features: [[13, 0, 2, 6, -1.], [13, 0, 1, 6, 2.]], threshold: 2.8619659133255482e-004, right_val: 0.5548306107521057, left_val: 0.4524914920330048 }, { features: [[0, 19, 2, 1, -1.], [1, 19, 1, 1, 2.]], threshold: 2.9425329557852820e-005, right_val: 0.4236463904380798, left_val: 0.5370373725891113 }, { features: [[16, 10, 4, 10, -1.], [18, 10, 2, 5, 2.], [16, 15, 2, 5, 2.]], threshold: -0.0248865708708763, right_val: 0.4969303905963898, left_val: 0.6423557996749878 }, { features: [[4, 8, 10, 3, -1.], [4, 9, 10, 1, 3.]], threshold: 0.0331488512456417, right_val: 0.1613811999559403, left_val: 0.4988475143909454 }, { features: [[14, 12, 3, 3, -1.], [14, 13, 3, 1, 3.]], threshold: 7.8491691965609789e-004, right_val: 0.4223009049892426, left_val: 0.5416026115417481 }, { features: [[0, 10, 4, 10, -1.], [0, 10, 2, 5, 2.], [2, 15, 2, 5, 2.]], threshold: 4.7087189741432667e-003, right_val: 0.6027557849884033, left_val: 0.4576328992843628 }, { features: [[18, 3, 2, 6, -1.], [18, 5, 2, 2, 3.]], threshold: 2.4144479539245367e-003, right_val: 0.4422498941421509, left_val: 0.5308973193168640 }, { features: [[6, 6, 1, 3, -1.], [6, 7, 1, 1, 3.]], threshold: 1.9523180089890957e-003, right_val: 0.6663324832916260, left_val: 0.4705634117126465 }, { features: [[7, 7, 7, 2, -1.], [7, 8, 7, 1, 2.]], threshold: 1.3031980488449335e-003, right_val: 0.5526962280273438, left_val: 0.4406126141548157 }, { features: [[0, 3, 2, 6, -1.], [0, 5, 2, 2, 3.]], threshold: 4.4735497795045376e-003, right_val: 0.3301498889923096, left_val: 0.5129023790359497 }, { features: [[11, 1, 3, 1, -1.], [12, 1, 1, 1, 3.]], threshold: -2.6652868837118149e-003, right_val: 0.5175036191940308, left_val: 0.3135471045970917 }, { features: [[5, 0, 2, 6, -1.], [6, 0, 1, 6, 2.]], threshold: 1.3666770246345550e-004, right_val: 0.5306876897811890, left_val: 0.4119370877742767 }, { features: [[1, 1, 18, 14, -1.], [7, 1, 6, 14, 3.]], threshold: -0.0171264503151178, right_val: 0.4836578965187073, left_val: 0.6177806258201599 }, { features: [[4, 6, 8, 3, -1.], [8, 6, 4, 3, 2.]], threshold: -2.6601430727168918e-004, right_val: 0.5169736742973328, left_val: 0.3654330968856812 }, { features: [[9, 12, 6, 2, -1.], [9, 12, 3, 2, 2.]], threshold: -0.0229323804378510, right_val: 0.5163992047309876, left_val: 0.3490915000438690 }, { features: [[5, 12, 6, 2, -1.], [8, 12, 3, 2, 2.]], threshold: 2.3316550068557262e-003, right_val: 0.3709389865398407, left_val: 0.5166299939155579 }, { features: [[10, 7, 3, 5, -1.], [11, 7, 1, 5, 3.]], threshold: 0.0169256608933210, right_val: 0.8053988218307495, left_val: 0.5014736056327820 }, { features: [[7, 7, 3, 5, -1.], [8, 7, 1, 5, 3.]], threshold: -8.9858826249837875e-003, right_val: 0.4657020866870880, left_val: 0.6470788717269898 }, { features: [[13, 0, 3, 10, -1.], [14, 0, 1, 10, 3.]], threshold: -0.0118746999651194, right_val: 0.5258755087852478, left_val: 0.3246378898620606 }, { features: [[4, 11, 3, 2, -1.], [4, 12, 3, 1, 2.]], threshold: 1.9350569345988333e-004, right_val: 0.3839643895626068, left_val: 0.5191941857337952 }, { features: [[17, 3, 3, 6, -1.], [18, 3, 1, 6, 3.]], threshold: 5.8713490143418312e-003, right_val: 0.6187043190002441, left_val: 0.4918133914470673 }, { features: [[1, 8, 18, 10, -1.], [1, 13, 18, 5, 2.]], threshold: -0.2483879029750824, right_val: 0.4988150000572205, left_val: 0.1836802959442139 }, { features: [[13, 0, 3, 10, -1.], [14, 0, 1, 10, 3.]], threshold: 0.0122560001909733, right_val: 0.3632029891014099, left_val: 0.5227053761482239 }, { features: [[9, 14, 2, 3, -1.], [9, 15, 2, 1, 3.]], threshold: 8.3990179700776935e-004, right_val: 0.5774148106575012, left_val: 0.4490250051021576 }, { features: [[16, 3, 3, 7, -1.], [17, 3, 1, 7, 3.]], threshold: 2.5407369248569012e-003, right_val: 0.5858299136161804, left_val: 0.4804787039756775 }, { features: [[4, 0, 3, 10, -1.], [5, 0, 1, 10, 3.]], threshold: -0.0148224299773574, right_val: 0.5023537278175354, left_val: 0.2521049976348877 }, { features: [[16, 3, 3, 7, -1.], [17, 3, 1, 7, 3.]], threshold: -5.7973959483206272e-003, right_val: 0.4853715002536774, left_val: 0.5996695756912231 }, { features: [[0, 9, 1, 2, -1.], [0, 10, 1, 1, 2.]], threshold: 7.2662148158997297e-004, right_val: 0.3671779930591583, left_val: 0.5153716802597046 }, { features: [[18, 1, 2, 10, -1.], [18, 1, 1, 10, 2.]], threshold: -0.0172325801104307, right_val: 0.4994656145572662, left_val: 0.6621719002723694 }, { features: [[0, 1, 2, 10, -1.], [1, 1, 1, 10, 2.]], threshold: 7.8624086454510689e-003, right_val: 0.6256101727485657, left_val: 0.4633395075798035 }, { features: [[10, 16, 3, 4, -1.], [11, 16, 1, 4, 3.]], threshold: -4.7343620099127293e-003, right_val: 0.5281885266304016, left_val: 0.3615573048591614 }, { features: [[2, 8, 3, 3, -1.], [3, 8, 1, 3, 3.]], threshold: 8.3048478700220585e-004, right_val: 0.5550957918167114, left_val: 0.4442889094352722 }, { features: [[11, 0, 2, 6, -1.], [12, 0, 1, 3, 2.], [11, 3, 1, 3, 2.]], threshold: 7.6602199114859104e-003, right_val: 0.2613354921340942, left_val: 0.5162935256958008 }, { features: [[7, 0, 2, 6, -1.], [7, 0, 1, 3, 2.], [8, 3, 1, 3, 2.]], threshold: -4.1048377752304077e-003, right_val: 0.5019031763076782, left_val: 0.2789632081985474 }, { features: [[16, 3, 3, 7, -1.], [17, 3, 1, 7, 3.]], threshold: 4.8512578941881657e-003, right_val: 0.5661668181419373, left_val: 0.4968984127044678 }, { features: [[1, 3, 3, 7, -1.], [2, 3, 1, 7, 3.]], threshold: 9.9896453320980072e-004, right_val: 0.5551813244819641, left_val: 0.4445607960224152 }, { features: [[14, 1, 6, 16, -1.], [16, 1, 2, 16, 3.]], threshold: -0.2702363133430481, right_val: 0.5151314139366150, left_val: 0.0293882098048925 }, { features: [[0, 1, 6, 16, -1.], [2, 1, 2, 16, 3.]], threshold: -0.0130906803533435, right_val: 0.4447459876537323, left_val: 0.5699399709701538 }, { features: [[2, 0, 16, 8, -1.], [10, 0, 8, 4, 2.], [2, 4, 8, 4, 2.]], threshold: -9.4342790544033051e-003, right_val: 0.5487895011901856, left_val: 0.4305466115474701 }, { features: [[6, 8, 5, 3, -1.], [6, 9, 5, 1, 3.]], threshold: -1.5482039889320731e-003, right_val: 0.5128080844879150, left_val: 0.3680317103862763 }, { features: [[9, 7, 3, 3, -1.], [10, 7, 1, 3, 3.]], threshold: 5.3746132180094719e-003, right_val: 0.6101555824279785, left_val: 0.4838916957378388 }, { features: [[8, 8, 4, 3, -1.], [8, 9, 4, 1, 3.]], threshold: 1.5786769799888134e-003, right_val: 0.4118548035621643, left_val: 0.5325223207473755 }, { features: [[9, 6, 2, 4, -1.], [9, 6, 1, 4, 2.]], threshold: 3.6856050137430429e-003, right_val: 0.6252303123474121, left_val: 0.4810948073863983 }, { features: [[0, 7, 15, 1, -1.], [5, 7, 5, 1, 3.]], threshold: 9.3887019902467728e-003, right_val: 0.3629410862922669, left_val: 0.5200229883193970 }, { features: [[8, 2, 7, 9, -1.], [8, 5, 7, 3, 3.]], threshold: 0.0127926301211119, right_val: 0.6738016009330750, left_val: 0.4961709976196289 }, { features: [[1, 7, 16, 4, -1.], [1, 7, 8, 2, 2.], [9, 9, 8, 2, 2.]], threshold: -3.3661040943115950e-003, right_val: 0.5283598899841309, left_val: 0.4060279130935669 }, { features: [[6, 12, 8, 2, -1.], [6, 13, 8, 1, 2.]], threshold: 3.9771420415490866e-004, right_val: 0.5900775194168091, left_val: 0.4674113988876343 }, { features: [[8, 11, 3, 3, -1.], [8, 12, 3, 1, 3.]], threshold: 1.4868030557408929e-003, right_val: 0.6082053780555725, left_val: 0.4519116878509522 }, { features: [[4, 5, 14, 10, -1.], [11, 5, 7, 5, 2.], [4, 10, 7, 5, 2.]], threshold: -0.0886867493391037, right_val: 0.5180991888046265, left_val: 0.2807899117469788 }, { features: [[4, 12, 3, 2, -1.], [4, 13, 3, 1, 2.]], threshold: -7.4296112870797515e-005, right_val: 0.4087625145912170, left_val: 0.5295584201812744 }, { features: [[9, 11, 6, 1, -1.], [11, 11, 2, 1, 3.]], threshold: -1.4932939848222304e-005, right_val: 0.4538542926311493, left_val: 0.5461400151252747 }, { features: [[4, 9, 7, 6, -1.], [4, 11, 7, 2, 3.]], threshold: 5.9162238612771034e-003, right_val: 0.4192134141921997, left_val: 0.5329161286354065 }, { features: [[7, 10, 6, 3, -1.], [7, 11, 6, 1, 3.]], threshold: 1.1141640134155750e-003, right_val: 0.5706217288970947, left_val: 0.4512017965316773 }, { features: [[9, 11, 2, 2, -1.], [9, 12, 2, 1, 2.]], threshold: 8.9249362645205110e-005, right_val: 0.5897638201713562, left_val: 0.4577805995941162 }, { features: [[0, 5, 20, 6, -1.], [0, 7, 20, 2, 3.]], threshold: 2.5319510605186224e-003, right_val: 0.3357639014720917, left_val: 0.5299603939056397 }, { features: [[6, 4, 6, 1, -1.], [8, 4, 2, 1, 3.]], threshold: 0.0124262003228068, right_val: 0.1346601992845535, left_val: 0.4959059059619904 }, { features: [[9, 11, 6, 1, -1.], [11, 11, 2, 1, 3.]], threshold: 0.0283357501029968, right_val: 6.1043637106195092e-004, left_val: 0.5117079019546509 }, { features: [[5, 11, 6, 1, -1.], [7, 11, 2, 1, 3.]], threshold: 6.6165882162749767e-003, right_val: 0.7011628150939941, left_val: 0.4736349880695343 }, { features: [[10, 16, 3, 4, -1.], [11, 16, 1, 4, 3.]], threshold: 8.0468766391277313e-003, right_val: 0.3282819986343384, left_val: 0.5216417908668518 }, { features: [[8, 7, 3, 3, -1.], [9, 7, 1, 3, 3.]], threshold: -1.1193980462849140e-003, right_val: 0.4563739001750946, left_val: 0.5809860825538635 }, { features: [[2, 12, 16, 8, -1.], [2, 16, 16, 4, 2.]], threshold: 0.0132775902748108, right_val: 0.4103901088237763, left_val: 0.5398362278938294 }, { features: [[0, 15, 15, 2, -1.], [0, 16, 15, 1, 2.]], threshold: 4.8794739996083081e-004, right_val: 0.5410590767860413, left_val: 0.4249286055564880 }, { features: [[15, 4, 5, 6, -1.], [15, 6, 5, 2, 3.]], threshold: 0.0112431701272726, right_val: 0.3438215851783752, left_val: 0.5269963741302490 }, { features: [[9, 5, 2, 4, -1.], [10, 5, 1, 4, 2.]], threshold: -8.9896668214350939e-004, right_val: 0.4456613063812256, left_val: 0.5633075833320618 }, { features: [[8, 10, 9, 6, -1.], [8, 12, 9, 2, 3.]], threshold: 6.6677159629762173e-003, right_val: 0.4362679123878479, left_val: 0.5312889218330383 }, { features: [[2, 19, 15, 1, -1.], [7, 19, 5, 1, 3.]], threshold: 0.0289472993463278, right_val: 0.6575797796249390, left_val: 0.4701794981956482 }, { features: [[10, 16, 3, 4, -1.], [11, 16, 1, 4, 3.]], threshold: -0.0234000496566296, right_val: 0.5137398838996887, left_val: 0. }, { features: [[0, 15, 20, 4, -1.], [0, 17, 20, 2, 2.]], threshold: -0.0891170501708984, right_val: 0.4942430853843689, left_val: 0.0237452797591686 }, { features: [[10, 16, 3, 4, -1.], [11, 16, 1, 4, 3.]], threshold: -0.0140546001493931, right_val: 0.5117511153221130, left_val: 0.3127323091030121 }, { features: [[7, 16, 3, 4, -1.], [8, 16, 1, 4, 3.]], threshold: 8.1239398568868637e-003, right_val: 0.2520025968551636, left_val: 0.5009049177169800 }, { features: [[9, 16, 3, 3, -1.], [9, 17, 3, 1, 3.]], threshold: -4.9964650534093380e-003, right_val: 0.4927811920642853, left_val: 0.6387143731117249 }, { features: [[8, 11, 4, 6, -1.], [8, 14, 4, 3, 2.]], threshold: 3.1253970228135586e-003, right_val: 0.3680452108383179, left_val: 0.5136849880218506 }, { features: [[9, 6, 2, 12, -1.], [9, 10, 2, 4, 3.]], threshold: 6.7669642157852650e-003, right_val: 0.4363631904125214, left_val: 0.5509843826293945 }, { features: [[8, 17, 4, 3, -1.], [8, 18, 4, 1, 3.]], threshold: -2.3711440153419971e-003, right_val: 0.4586946964263916, left_val: 0.6162335276603699 }, { features: [[9, 18, 8, 2, -1.], [13, 18, 4, 1, 2.], [9, 19, 4, 1, 2.]], threshold: -5.3522791713476181e-003, right_val: 0.4920490980148315, left_val: 0.6185457706451416 }, { features: [[1, 18, 8, 2, -1.], [1, 19, 8, 1, 2.]], threshold: -0.0159688591957092, right_val: 0.4983252882957459, left_val: 0.1382617950439453 }, { features: [[13, 5, 6, 15, -1.], [15, 5, 2, 15, 3.]], threshold: 4.7676060348749161e-003, right_val: 0.5490046143531799, left_val: 0.4688057899475098 }, { features: [[9, 8, 2, 2, -1.], [9, 9, 2, 1, 2.]], threshold: -2.4714691098779440e-003, right_val: 0.5003952980041504, left_val: 0.2368514984846115 }, { features: [[9, 5, 2, 3, -1.], [9, 5, 1, 3, 2.]], threshold: -7.1033788844943047e-004, right_val: 0.4721533060073853, left_val: 0.5856394171714783 }, { features: [[1, 5, 6, 15, -1.], [3, 5, 2, 15, 3.]], threshold: -0.1411755979061127, right_val: 0.4961591064929962, left_val: 0.0869000628590584 }, { features: [[4, 1, 14, 8, -1.], [11, 1, 7, 4, 2.], [4, 5, 7, 4, 2.]], threshold: 0.1065180972218514, right_val: 0.1741005033254623, left_val: 0.5138837099075317 }, { features: [[2, 4, 4, 16, -1.], [2, 4, 2, 8, 2.], [4, 12, 2, 8, 2.]], threshold: -0.0527447499334812, right_val: 0.4772881865501404, left_val: 0.7353636026382446 }, { features: [[12, 4, 3, 12, -1.], [12, 10, 3, 6, 2.]], threshold: -4.7431760467588902e-003, right_val: 0.5292701721191406, left_val: 0.3884406089782715 }, { features: [[4, 5, 10, 12, -1.], [4, 5, 5, 6, 2.], [9, 11, 5, 6, 2.]], threshold: 9.9676765967160463e-004, right_val: 0.4003424048423767, left_val: 0.5223492980003357 }, { features: [[9, 14, 2, 3, -1.], [9, 15, 2, 1, 3.]], threshold: 8.0284131690859795e-003, right_val: 0.7212964296340942, left_val: 0.4959106147289276 }, { features: [[5, 4, 2, 3, -1.], [5, 5, 2, 1, 3.]], threshold: 8.6025858763605356e-004, right_val: 0.5538476109504700, left_val: 0.4444884061813355 }, { features: [[12, 2, 4, 10, -1.], [14, 2, 2, 5, 2.], [12, 7, 2, 5, 2.]], threshold: 9.3191501218825579e-004, right_val: 0.4163244068622589, left_val: 0.5398371219635010 }, { features: [[6, 4, 7, 3, -1.], [6, 5, 7, 1, 3.]], threshold: -2.5082060601562262e-003, right_val: 0.4562500119209290, left_val: 0.5854265093803406 }, { features: [[2, 0, 18, 2, -1.], [11, 0, 9, 1, 2.], [2, 1, 9, 1, 2.]], threshold: -2.1378761157393456e-003, right_val: 0.5280259251594544, left_val: 0.4608069062232971 }, { features: [[0, 0, 18, 2, -1.], [0, 0, 9, 1, 2.], [9, 1, 9, 1, 2.]], threshold: -2.1546049974858761e-003, right_val: 0.5255997180938721, left_val: 0.3791126906871796 }, { features: [[13, 13, 4, 6, -1.], [15, 13, 2, 3, 2.], [13, 16, 2, 3, 2.]], threshold: -7.6214009895920753e-003, right_val: 0.4952073991298676, left_val: 0.5998609066009522 }, { features: [[3, 13, 4, 6, -1.], [3, 13, 2, 3, 2.], [5, 16, 2, 3, 2.]], threshold: 2.2055360022932291e-003, right_val: 0.5588530898094177, left_val: 0.4484206140041351 }, { features: [[10, 12, 2, 6, -1.], [10, 15, 2, 3, 2.]], threshold: 1.2586950324475765e-003, right_val: 0.4423840939998627, left_val: 0.5450747013092041 }, { features: [[5, 9, 10, 10, -1.], [5, 9, 5, 5, 2.], [10, 14, 5, 5, 2.]], threshold: -5.0926720723509789e-003, right_val: 0.5263035893440247, left_val: 0.4118275046348572 }, { features: [[11, 4, 4, 2, -1.], [13, 4, 2, 1, 2.], [11, 5, 2, 1, 2.]], threshold: -2.5095739401876926e-003, right_val: 0.4998494982719421, left_val: 0.5787907838821411 }, { features: [[7, 12, 6, 8, -1.], [10, 12, 3, 8, 2.]], threshold: -0.0773275569081306, right_val: 0.4811120033264160, left_val: 0.8397865891456604 }, { features: [[12, 2, 4, 10, -1.], [14, 2, 2, 5, 2.], [12, 7, 2, 5, 2.]], threshold: -0.0414858199656010, right_val: 0.5176993012428284, left_val: 0.2408611029386520 }, { features: [[8, 11, 2, 1, -1.], [9, 11, 1, 1, 2.]], threshold: 1.0355669655837119e-004, right_val: 0.5417054295539856, left_val: 0.4355360865592957 }, { features: [[10, 5, 1, 12, -1.], [10, 9, 1, 4, 3.]], threshold: 1.3255809899419546e-003, right_val: 0.4894095063209534, left_val: 0.5453971028327942 }, { features: [[0, 11, 6, 9, -1.], [3, 11, 3, 9, 2.]], threshold: -8.0598732456564903e-003, right_val: 0.4577918946743012, left_val: 0.5771024227142334 }, { features: [[12, 2, 4, 10, -1.], [14, 2, 2, 5, 2.], [12, 7, 2, 5, 2.]], threshold: 0.0190586205571890, right_val: 0.3400475084781647, left_val: 0.5169867873191834 }, { features: [[4, 2, 4, 10, -1.], [4, 2, 2, 5, 2.], [6, 7, 2, 5, 2.]], threshold: -0.0350578911602497, right_val: 0.5000503063201904, left_val: 0.2203243970870972 }, { features: [[11, 4, 4, 2, -1.], [13, 4, 2, 1, 2.], [11, 5, 2, 1, 2.]], threshold: 5.7296059094369411e-003, right_val: 0.6597570776939392, left_val: 0.5043408274650574 }, { features: [[0, 14, 6, 3, -1.], [0, 15, 6, 1, 3.]], threshold: -0.0116483299061656, right_val: 0.4996652901172638, left_val: 0.2186284959316254 }, { features: [[11, 4, 4, 2, -1.], [13, 4, 2, 1, 2.], [11, 5, 2, 1, 2.]], threshold: 1.4544479781761765e-003, right_val: 0.5503727793693543, left_val: 0.5007681846618652 }, { features: [[6, 1, 3, 2, -1.], [7, 1, 1, 2, 3.]], threshold: -2.5030909455381334e-004, right_val: 0.5241670012474060, left_val: 0.4129841029644013 }, { features: [[11, 4, 4, 2, -1.], [13, 4, 2, 1, 2.], [11, 5, 2, 1, 2.]], threshold: -8.2907272735610604e-004, right_val: 0.4974496066570282, left_val: 0.5412868261337280 }, { features: [[5, 4, 4, 2, -1.], [5, 4, 2, 1, 2.], [7, 5, 2, 1, 2.]], threshold: 1.0862209601327777e-003, right_val: 0.5879228711128235, left_val: 0.4605529904365540 }, { features: [[13, 0, 2, 12, -1.], [14, 0, 1, 6, 2.], [13, 6, 1, 6, 2.]], threshold: 2.0000500080641359e-004, right_val: 0.4705209136009216, left_val: 0.5278854966163635 }, { features: [[6, 0, 3, 10, -1.], [7, 0, 1, 10, 3.]], threshold: 2.9212920926511288e-003, right_val: 0.3755536973476410, left_val: 0.5129609704017639 }, { features: [[3, 0, 17, 8, -1.], [3, 4, 17, 4, 2.]], threshold: 0.0253874007612467, right_val: 0.5790768265724182, left_val: 0.4822691977024078 }, { features: [[0, 4, 20, 4, -1.], [0, 6, 20, 2, 2.]], threshold: -3.1968469265848398e-003, right_val: 0.3962840139865875, left_val: 0.5248395204544067 }], threshold: 87.6960296630859380 }, { simpleClassifiers: [{ features: [[0, 3, 8, 2, -1.], [4, 3, 4, 2, 2.]], threshold: 5.8031738735735416e-003, right_val: 0.5961983203887940, left_val: 0.3498983979225159 }, { features: [[8, 11, 4, 3, -1.], [8, 12, 4, 1, 3.]], threshold: -9.0003069490194321e-003, right_val: 0.4478552043437958, left_val: 0.6816636919975281 }, { features: [[5, 7, 6, 4, -1.], [5, 7, 3, 2, 2.], [8, 9, 3, 2, 2.]], threshold: -1.1549659539014101e-003, right_val: 0.3578251004219055, left_val: 0.5585706233978272 }, { features: [[8, 3, 4, 9, -1.], [8, 6, 4, 3, 3.]], threshold: -1.1069850297644734e-003, right_val: 0.3050428032875061, left_val: 0.5365036129951477 }, { features: [[8, 15, 1, 4, -1.], [8, 17, 1, 2, 2.]], threshold: 1.0308309720130637e-004, right_val: 0.5344635844230652, left_val: 0.3639095127582550 }, { features: [[4, 5, 12, 7, -1.], [8, 5, 4, 7, 3.]], threshold: -5.0984839908778667e-003, right_val: 0.5504264831542969, left_val: 0.2859157025814056 }, { features: [[4, 2, 4, 10, -1.], [4, 2, 2, 5, 2.], [6, 7, 2, 5, 2.]], threshold: 8.2572200335562229e-004, right_val: 0.3476041853427887, left_val: 0.5236523747444153 }, { features: [[3, 0, 17, 2, -1.], [3, 1, 17, 1, 2.]], threshold: 9.9783325567841530e-003, right_val: 0.6219646930694580, left_val: 0.4750322103500366 }, { features: [[2, 2, 16, 15, -1.], [2, 7, 16, 5, 3.]], threshold: -0.0374025292694569, right_val: 0.5278062820434570, left_val: 0.3343375921249390 }, { features: [[15, 2, 5, 2, -1.], [15, 3, 5, 1, 2.]], threshold: 4.8548257909715176e-003, right_val: 0.3700444102287293, left_val: 0.5192180871963501 }, { features: [[9, 3, 2, 2, -1.], [10, 3, 1, 2, 2.]], threshold: -1.8664470408111811e-003, right_val: 0.5091944932937622, left_val: 0.2929843962192535 }, { features: [[4, 5, 16, 15, -1.], [4, 10, 16, 5, 3.]], threshold: 0.0168888904154301, right_val: 0.5431225895881653, left_val: 0.3686845898628235 }, { features: [[7, 13, 5, 6, -1.], [7, 16, 5, 3, 2.]], threshold: -5.8372621424496174e-003, right_val: 0.5221335887908936, left_val: 0.3632183969020844 }, { features: [[10, 7, 3, 2, -1.], [11, 7, 1, 2, 3.]], threshold: -1.4713739510625601e-003, right_val: 0.4700650870800018, left_val: 0.5870683789253235 }, { features: [[8, 3, 3, 1, -1.], [9, 3, 1, 1, 3.]], threshold: -1.1522950371727347e-003, right_val: 0.5140954256057739, left_val: 0.3195894956588745 }, { features: [[9, 16, 3, 3, -1.], [9, 17, 3, 1, 3.]], threshold: -4.2560300789773464e-003, right_val: 0.4814921021461487, left_val: 0.6301859021186829 }, { features: [[0, 2, 5, 2, -1.], [0, 3, 5, 1, 2.]], threshold: -6.7378291860222816e-003, right_val: 0.5025808215141296, left_val: 0.1977048069238663 }, { features: [[12, 5, 4, 3, -1.], [12, 6, 4, 1, 3.]], threshold: 0.0113826701417565, right_val: 0.6867045760154724, left_val: 0.4954132139682770 }, { features: [[1, 7, 12, 1, -1.], [5, 7, 4, 1, 3.]], threshold: 5.1794708706438541e-003, right_val: 0.3350647985935211, left_val: 0.5164427757263184 }, { features: [[7, 5, 6, 14, -1.], [7, 12, 6, 7, 2.]], threshold: -0.1174378991127014, right_val: 0.5234413743019104, left_val: 0.2315246015787125 }, { features: [[0, 0, 8, 10, -1.], [0, 0, 4, 5, 2.], [4, 5, 4, 5, 2.]], threshold: 0.0287034492939711, right_val: 0.6722521185874939, left_val: 0.4664297103881836 }, { features: [[9, 1, 3, 2, -1.], [10, 1, 1, 2, 3.]], threshold: 4.8231030814349651e-003, right_val: 0.2723532915115356, left_val: 0.5220875144004822 }, { features: [[8, 1, 3, 2, -1.], [9, 1, 1, 2, 3.]], threshold: 2.6798530016094446e-003, right_val: 0.2906948924064636, left_val: 0.5079277157783508 }, { features: [[12, 4, 3, 3, -1.], [12, 5, 3, 1, 3.]], threshold: 8.0504082143306732e-003, right_val: 0.6395021080970764, left_val: 0.4885950982570648 }, { features: [[7, 4, 6, 16, -1.], [7, 12, 6, 8, 2.]], threshold: 4.8054959625005722e-003, right_val: 0.3656663894653320, left_val: 0.5197256803512573 }, { features: [[12, 4, 3, 3, -1.], [12, 5, 3, 1, 3.]], threshold: -2.2420159075409174e-003, right_val: 0.4763701856136322, left_val: 0.6153467893600464 }, { features: [[2, 3, 2, 6, -1.], [2, 5, 2, 2, 3.]], threshold: -0.0137577103450894, right_val: 0.5030903220176697, left_val: 0.2637344896793366 }, { features: [[14, 2, 6, 9, -1.], [14, 5, 6, 3, 3.]], threshold: -0.1033829972147942, right_val: 0.5182461142539978, left_val: 0.2287521958351135 }, { features: [[5, 4, 3, 3, -1.], [5, 5, 3, 1, 3.]], threshold: -9.4432085752487183e-003, right_val: 0.4694949090480804, left_val: 0.6953303813934326 }, { features: [[9, 17, 3, 2, -1.], [10, 17, 1, 2, 3.]], threshold: 8.0271181650459766e-004, right_val: 0.4268783926963806, left_val: 0.5450655221939087 }, { features: [[5, 5, 2, 3, -1.], [5, 6, 2, 1, 3.]], threshold: -4.1945669800043106e-003, right_val: 0.4571642875671387, left_val: 0.6091387867927551 }, { features: [[13, 11, 3, 6, -1.], [13, 13, 3, 2, 3.]], threshold: 0.0109422104433179, right_val: 0.3284547030925751, left_val: 0.5241063237190247 }, { features: [[3, 14, 2, 6, -1.], [3, 17, 2, 3, 2.]], threshold: -5.7841069065034389e-004, right_val: 0.4179368913173676, left_val: 0.5387929081916809 }, { features: [[14, 3, 6, 2, -1.], [14, 4, 6, 1, 2.]], threshold: -2.0888620056211948e-003, right_val: 0.5301715731620789, left_val: 0.4292691051959992 }, { features: [[0, 8, 16, 2, -1.], [0, 9, 16, 1, 2.]], threshold: 3.2383969519287348e-003, right_val: 0.5220744013786316, left_val: 0.3792347908020020 }, { features: [[14, 3, 6, 2, -1.], [14, 4, 6, 1, 2.]], threshold: 4.9075027927756310e-003, right_val: 0.4126757979393005, left_val: 0.5237283110618591 }, { features: [[0, 0, 5, 6, -1.], [0, 2, 5, 2, 3.]], threshold: -0.0322779417037964, right_val: 0.4994502067565918, left_val: 0.1947655975818634 }, { features: [[12, 5, 4, 3, -1.], [12, 6, 4, 1, 3.]], threshold: -8.9711230248212814e-003, right_val: 0.4929032027721405, left_val: 0.6011285185813904 }, { features: [[4, 11, 3, 6, -1.], [4, 13, 3, 2, 3.]], threshold: 0.0153210898861289, right_val: 0.2039822041988373, left_val: 0.5009753704071045 }, { features: [[12, 5, 4, 3, -1.], [12, 6, 4, 1, 3.]], threshold: 2.0855569746345282e-003, right_val: 0.5721694827079773, left_val: 0.4862189888954163 }, { features: [[9, 5, 1, 3, -1.], [9, 6, 1, 1, 3.]], threshold: 5.0615021027624607e-003, right_val: 0.1801805943250656, left_val: 0.5000218749046326 }, { features: [[12, 5, 4, 3, -1.], [12, 6, 4, 1, 3.]], threshold: -3.7174751050770283e-003, right_val: 0.4897592961788178, left_val: 0.5530117154121399 }, { features: [[6, 6, 8, 12, -1.], [6, 12, 8, 6, 2.]], threshold: -0.0121705001220107, right_val: 0.5383723974227905, left_val: 0.4178605973720551 }, { features: [[12, 5, 4, 3, -1.], [12, 6, 4, 1, 3.]], threshold: 4.6248398721218109e-003, right_val: 0.5761327147483826, left_val: 0.4997169971466065 }, { features: [[5, 12, 9, 2, -1.], [8, 12, 3, 2, 3.]], threshold: -2.1040429419372231e-004, right_val: 0.4097681045532227, left_val: 0.5331807136535645 }, { features: [[12, 5, 4, 3, -1.], [12, 6, 4, 1, 3.]], threshold: -0.0146417804062366, right_val: 0.5051776170730591, left_val: 0.5755925178527832 }, { features: [[4, 5, 4, 3, -1.], [4, 6, 4, 1, 3.]], threshold: 3.3199489116668701e-003, right_val: 0.6031805872917175, left_val: 0.4576976895332336 }, { features: [[6, 6, 9, 2, -1.], [9, 6, 3, 2, 3.]], threshold: 3.7236879579722881e-003, right_val: 0.5415883064270020, left_val: 0.4380396902561188 }, { features: [[4, 11, 1, 3, -1.], [4, 12, 1, 1, 3.]], threshold: 8.2951161311939359e-004, right_val: 0.3702219128608704, left_val: 0.5163031816482544 }, { features: [[14, 12, 6, 6, -1.], [14, 12, 3, 6, 2.]], threshold: -0.0114084901288152, right_val: 0.4862565100193024, left_val: 0.6072946786880493 }, { features: [[7, 0, 3, 7, -1.], [8, 0, 1, 7, 3.]], threshold: -4.5320121571421623e-003, right_val: 0.5088962912559509, left_val: 0.3292475938796997 }, { features: [[9, 8, 3, 3, -1.], [10, 8, 1, 3, 3.]], threshold: 5.1276017911732197e-003, right_val: 0.6122708916664124, left_val: 0.4829767942428589 }, { features: [[8, 8, 3, 3, -1.], [9, 8, 1, 3, 3.]], threshold: 9.8583158105611801e-003, right_val: 0.6556177139282227, left_val: 0.4660679996013641 }, { features: [[5, 10, 11, 3, -1.], [5, 11, 11, 1, 3.]], threshold: 0.0369859188795090, right_val: 0.1690472066402435, left_val: 0.5204849243164063 }, { features: [[5, 7, 10, 1, -1.], [10, 7, 5, 1, 2.]], threshold: 4.6491161920130253e-003, right_val: 0.3725225031375885, left_val: 0.5167322158813477 }, { features: [[9, 7, 3, 2, -1.], [10, 7, 1, 2, 3.]], threshold: -4.2664702050387859e-003, right_val: 0.4987342953681946, left_val: 0.6406493186950684 }, { features: [[8, 7, 3, 2, -1.], [9, 7, 1, 2, 3.]], threshold: -4.7956590424291790e-004, right_val: 0.4464873969554901, left_val: 0.5897293090820313 }, { features: [[11, 9, 4, 2, -1.], [11, 9, 2, 2, 2.]], threshold: 3.6827160511165857e-003, right_val: 0.3472662866115570, left_val: 0.5441560745239258 }, { features: [[5, 9, 4, 2, -1.], [7, 9, 2, 2, 2.]], threshold: -0.0100598800927401, right_val: 0.5004829764366150, left_val: 0.2143162935972214 }, { features: [[14, 10, 2, 4, -1.], [14, 12, 2, 2, 2.]], threshold: -3.0361840617842972e-004, right_val: 0.4590323865413666, left_val: 0.5386424064636231 }, { features: [[7, 7, 3, 2, -1.], [8, 7, 1, 2, 3.]], threshold: -1.4545479789376259e-003, right_val: 0.4497095048427582, left_val: 0.5751184225082398 }, { features: [[14, 17, 6, 3, -1.], [14, 18, 6, 1, 3.]], threshold: 1.6515209572389722e-003, right_val: 0.4238520860671997, left_val: 0.5421937704086304 }, { features: [[4, 5, 12, 12, -1.], [4, 5, 6, 6, 2.], [10, 11, 6, 6, 2.]], threshold: -7.8468639403581619e-003, right_val: 0.5258157253265381, left_val: 0.4077920913696289 }, { features: [[6, 9, 8, 8, -1.], [10, 9, 4, 4, 2.], [6, 13, 4, 4, 2.]], threshold: -5.1259850151836872e-003, right_val: 0.5479453206062317, left_val: 0.4229275882244110 }, { features: [[0, 4, 15, 4, -1.], [5, 4, 5, 4, 3.]], threshold: -0.0368909612298012, right_val: 0.4674678146839142, left_val: 0.6596375703811646 }, { features: [[13, 2, 4, 1, -1.], [13, 2, 2, 1, 2.]], threshold: 2.4035639944486320e-004, right_val: 0.5573202967643738, left_val: 0.4251135885715485 }, { features: [[4, 12, 2, 2, -1.], [4, 13, 2, 1, 2.]], threshold: -1.5150169929256663e-005, right_val: 0.4074114859104157, left_val: 0.5259246826171875 }, { features: [[8, 13, 4, 3, -1.], [8, 14, 4, 1, 3.]], threshold: 2.2108471021056175e-003, right_val: 0.5886352062225342, left_val: 0.4671722948551178 }, { features: [[9, 13, 2, 3, -1.], [9, 14, 2, 1, 3.]], threshold: -1.1568620102480054e-003, right_val: 0.4487161934375763, left_val: 0.5711066126823425 }, { features: [[13, 11, 2, 3, -1.], [13, 12, 2, 1, 3.]], threshold: 4.9996292218565941e-003, right_val: 0.2898327112197876, left_val: 0.5264198184013367 }, { features: [[7, 12, 4, 4, -1.], [7, 12, 2, 2, 2.], [9, 14, 2, 2, 2.]], threshold: -1.4656189596280456e-003, right_val: 0.5197871923446655, left_val: 0.3891738057136536 }, { features: [[10, 11, 2, 2, -1.], [11, 11, 1, 1, 2.], [10, 12, 1, 1, 2.]], threshold: -1.1975039960816503e-003, right_val: 0.4927955865859985, left_val: 0.5795872807502747 }, { features: [[8, 17, 3, 2, -1.], [9, 17, 1, 2, 3.]], threshold: -4.4954330660402775e-003, right_val: 0.5012555122375488, left_val: 0.2377603054046631 }, { features: [[10, 11, 2, 2, -1.], [11, 11, 1, 1, 2.], [10, 12, 1, 1, 2.]], threshold: 1.4997160178609192e-004, right_val: 0.5617607831954956, left_val: 0.4876626133918762 }, { features: [[0, 17, 6, 3, -1.], [0, 18, 6, 1, 3.]], threshold: 2.6391509454697371e-003, right_val: 0.3765509128570557, left_val: 0.5168088078498840 }, { features: [[10, 11, 2, 2, -1.], [11, 11, 1, 1, 2.], [10, 12, 1, 1, 2.]], threshold: -2.9368131072260439e-004, right_val: 0.4874630868434906, left_val: 0.5446649193763733 }, { features: [[8, 11, 2, 2, -1.], [8, 11, 1, 1, 2.], [9, 12, 1, 1, 2.]], threshold: 1.4211760135367513e-003, right_val: 0.6691331863403320, left_val: 0.4687897861003876 }, { features: [[12, 5, 8, 4, -1.], [12, 5, 4, 4, 2.]], threshold: 0.0794276371598244, right_val: 0.2732945978641510, left_val: 0.5193443894386292 }, { features: [[0, 5, 8, 4, -1.], [4, 5, 4, 4, 2.]], threshold: 0.0799375027418137, right_val: 0.1782083958387375, left_val: 0.4971731007099152 }, { features: [[13, 2, 4, 1, -1.], [13, 2, 2, 1, 2.]], threshold: 0.0110892597585917, right_val: 0.3209475874900818, left_val: 0.5165994763374329 }, { features: [[3, 2, 4, 1, -1.], [5, 2, 2, 1, 2.]], threshold: 1.6560709627810866e-004, right_val: 0.5307276248931885, left_val: 0.4058471918106079 }, { features: [[10, 0, 4, 2, -1.], [12, 0, 2, 1, 2.], [10, 1, 2, 1, 2.]], threshold: -5.3354292176663876e-003, right_val: 0.5158129930496216, left_val: 0.3445056974887848 }, { features: [[7, 12, 3, 1, -1.], [8, 12, 1, 1, 3.]], threshold: 1.1287260567769408e-003, right_val: 0.6075533032417297, left_val: 0.4594863057136536 }, { features: [[8, 11, 4, 8, -1.], [10, 11, 2, 4, 2.], [8, 15, 2, 4, 2.]], threshold: -0.0219692196696997, right_val: 0.5228595733642578, left_val: 0.1680400967597961 }, { features: [[9, 9, 2, 2, -1.], [9, 10, 2, 1, 2.]], threshold: -2.1775320055894554e-004, right_val: 0.5215672850608826, left_val: 0.3861596882343292 }, { features: [[3, 18, 15, 2, -1.], [3, 19, 15, 1, 2.]], threshold: 2.0200149447191507e-004, right_val: 0.4363039135932922, left_val: 0.5517979264259338 }, { features: [[2, 6, 2, 12, -1.], [2, 6, 1, 6, 2.], [3, 12, 1, 6, 2.]], threshold: -0.0217331498861313, right_val: 0.4789851009845734, left_val: 0.7999460101127625 }, { features: [[9, 8, 2, 3, -1.], [9, 9, 2, 1, 3.]], threshold: -8.4399932529777288e-004, right_val: 0.5374773144721985, left_val: 0.4085975885391235 }, { features: [[7, 10, 3, 2, -1.], [8, 10, 1, 2, 3.]], threshold: -4.3895249837078154e-004, right_val: 0.4366143047809601, left_val: 0.5470405220985413 }, { features: [[11, 11, 3, 1, -1.], [12, 11, 1, 1, 3.]], threshold: 1.5092400135472417e-003, right_val: 0.5842149257659912, left_val: 0.4988996982574463 }, { features: [[6, 11, 3, 1, -1.], [7, 11, 1, 1, 3.]], threshold: -3.5547839943319559e-003, right_val: 0.4721005856990814, left_val: 0.6753690242767334 }, { features: [[9, 2, 4, 2, -1.], [11, 2, 2, 1, 2.], [9, 3, 2, 1, 2.]], threshold: 4.8191400128416717e-004, right_val: 0.4357109069824219, left_val: 0.5415853857994080 }, { features: [[4, 12, 2, 3, -1.], [4, 13, 2, 1, 3.]], threshold: -6.0264398343861103e-003, right_val: 0.4991880953311920, left_val: 0.2258509993553162 }, { features: [[2, 1, 18, 3, -1.], [8, 1, 6, 3, 3.]], threshold: -0.0116681400686502, right_val: 0.4927498996257782, left_val: 0.6256554722785950 }, { features: [[5, 1, 4, 14, -1.], [7, 1, 2, 14, 2.]], threshold: -2.8718370012938976e-003, right_val: 0.5245801806449890, left_val: 0.3947784900665283 }, { features: [[8, 16, 12, 3, -1.], [8, 16, 6, 3, 2.]], threshold: 0.0170511696487665, right_val: 0.5794224143028259, left_val: 0.4752511084079742 }, { features: [[1, 17, 18, 3, -1.], [7, 17, 6, 3, 3.]], threshold: -0.0133520802482963, right_val: 0.4544535875320435, left_val: 0.6041104793548584 }, { features: [[9, 14, 2, 6, -1.], [9, 17, 2, 3, 2.]], threshold: -3.9301801007241011e-004, right_val: 0.5544905066490173, left_val: 0.4258275926113129 }, { features: [[9, 12, 1, 8, -1.], [9, 16, 1, 4, 2.]], threshold: 3.0483349692076445e-003, right_val: 0.3780272901058197, left_val: 0.5233420133590698 }, { features: [[9, 14, 2, 3, -1.], [9, 15, 2, 1, 3.]], threshold: -4.3579288758337498e-003, right_val: 0.4838674068450928, left_val: 0.6371889114379883 }, { features: [[9, 6, 2, 12, -1.], [9, 10, 2, 4, 3.]], threshold: 5.6661018170416355e-003, right_val: 0.4163666069507599, left_val: 0.5374705791473389 }, { features: [[12, 9, 3, 3, -1.], [12, 10, 3, 1, 3.]], threshold: 6.0677339206449687e-005, right_val: 0.5311625003814697, left_val: 0.4638795852661133 }, { features: [[0, 1, 4, 8, -1.], [2, 1, 2, 8, 2.]], threshold: 0.0367381609976292, right_val: 0.6466524004936218, left_val: 0.4688656032085419 }, { features: [[9, 1, 6, 2, -1.], [12, 1, 3, 1, 2.], [9, 2, 3, 1, 2.]], threshold: 8.6528137326240540e-003, right_val: 0.2188657969236374, left_val: 0.5204318761825562 }, { features: [[1, 3, 12, 14, -1.], [1, 10, 12, 7, 2.]], threshold: -0.1537135988473892, right_val: 0.4958840012550354, left_val: 0.1630371958017349 }, { features: [[8, 12, 4, 2, -1.], [10, 12, 2, 1, 2.], [8, 13, 2, 1, 2.]], threshold: -4.1560421232134104e-004, right_val: 0.4696458876132965, left_val: 0.5774459242820740 }, { features: [[1, 9, 10, 2, -1.], [1, 9, 5, 1, 2.], [6, 10, 5, 1, 2.]], threshold: -1.2640169588848948e-003, right_val: 0.5217198133468628, left_val: 0.3977175951004028 }, { features: [[8, 15, 4, 3, -1.], [8, 16, 4, 1, 3.]], threshold: -3.5473341122269630e-003, right_val: 0.4808315038681030, left_val: 0.6046528220176697 }, { features: [[6, 8, 8, 3, -1.], [6, 9, 8, 1, 3.]], threshold: 3.0019069527043030e-005, right_val: 0.5228201150894165, left_val: 0.3996723890304565 }, { features: [[9, 15, 5, 3, -1.], [9, 16, 5, 1, 3.]], threshold: 1.3113019522279501e-003, right_val: 0.5765997767448425, left_val: 0.4712158143520355 }, { features: [[8, 7, 4, 3, -1.], [8, 8, 4, 1, 3.]], threshold: -1.3374709524214268e-003, right_val: 0.5253170132637024, left_val: 0.4109584987163544 }, { features: [[7, 7, 6, 2, -1.], [7, 8, 6, 1, 2.]], threshold: 0.0208767093718052, right_val: 0.1757981926202774, left_val: 0.5202993750572205 }, { features: [[5, 7, 8, 2, -1.], [5, 7, 4, 1, 2.], [9, 8, 4, 1, 2.]], threshold: -7.5497948564589024e-003, right_val: 0.4694975018501282, left_val: 0.6566609740257263 }, { features: [[12, 9, 3, 3, -1.], [12, 10, 3, 1, 3.]], threshold: 0.0241885501891375, right_val: 0.3370220959186554, left_val: 0.5128673911094666 }, { features: [[4, 7, 4, 2, -1.], [4, 8, 4, 1, 2.]], threshold: -2.9358828905969858e-003, right_val: 0.4694541096687317, left_val: 0.6580786705017090 }, { features: [[14, 2, 6, 9, -1.], [14, 5, 6, 3, 3.]], threshold: 0.0575579293072224, right_val: 0.2775259912014008, left_val: 0.5146445035934448 }, { features: [[4, 9, 3, 3, -1.], [5, 9, 1, 3, 3.]], threshold: -1.1343370424583554e-003, right_val: 0.5192667245864868, left_val: 0.3836601972579956 }, { features: [[12, 9, 3, 3, -1.], [12, 10, 3, 1, 3.]], threshold: 0.0168169997632504, right_val: 0.6177260875701904, left_val: 0.5085592865943909 }, { features: [[0, 2, 6, 9, -1.], [0, 5, 6, 3, 3.]], threshold: 5.0535178743302822e-003, right_val: 0.3684791922569275, left_val: 0.5138763189315796 }, { features: [[17, 3, 3, 6, -1.], [18, 3, 1, 6, 3.]], threshold: -4.5874710194766521e-003, right_val: 0.4835202097892761, left_val: 0.5989655256271362 }, { features: [[0, 3, 3, 6, -1.], [1, 3, 1, 6, 3.]], threshold: 1.6882460331544280e-003, right_val: 0.5723056793212891, left_val: 0.4509486854076386 }, { features: [[17, 14, 1, 2, -1.], [17, 15, 1, 1, 2.]], threshold: -1.6554000321775675e-003, right_val: 0.5243319272994995, left_val: 0.3496770858764648 }, { features: [[4, 9, 4, 3, -1.], [6, 9, 2, 3, 2.]], threshold: -0.0193738006055355, right_val: 0.4968712925910950, left_val: 0.1120536997914314 }, { features: [[12, 9, 3, 3, -1.], [12, 10, 3, 1, 3.]], threshold: 0.0103744501248002, right_val: 0.4395213127136231, left_val: 0.5148196816444397 }, { features: [[5, 9, 3, 3, -1.], [5, 10, 3, 1, 3.]], threshold: 1.4973050565458834e-004, right_val: 0.5269886851310730, left_val: 0.4084999859333038 }, { features: [[9, 5, 6, 8, -1.], [12, 5, 3, 4, 2.], [9, 9, 3, 4, 2.]], threshold: -0.0429819300770760, right_val: 0.5018504261970520, left_val: 0.6394104957580566 }, { features: [[5, 5, 6, 8, -1.], [5, 5, 3, 4, 2.], [8, 9, 3, 4, 2.]], threshold: 8.3065936341881752e-003, right_val: 0.6698353290557861, left_val: 0.4707553982734680 }, { features: [[16, 1, 4, 6, -1.], [16, 4, 4, 3, 2.]], threshold: -4.1285790503025055e-003, right_val: 0.5323647260665894, left_val: 0.4541369080543518 }, { features: [[1, 0, 6, 20, -1.], [3, 0, 2, 20, 3.]], threshold: 1.7399420030415058e-003, right_val: 0.5439866185188294, left_val: 0.4333961904048920 }, { features: [[12, 11, 3, 2, -1.], [13, 11, 1, 2, 3.]], threshold: 1.1739750334527344e-004, right_val: 0.5543426275253296, left_val: 0.4579687118530273 }, { features: [[5, 11, 3, 2, -1.], [6, 11, 1, 2, 3.]], threshold: 1.8585780344437808e-004, right_val: 0.5426754951477051, left_val: 0.4324643909931183 }, { features: [[9, 4, 6, 1, -1.], [11, 4, 2, 1, 3.]], threshold: 5.5587692186236382e-003, right_val: 0.3550611138343811, left_val: 0.5257220864295960 }, { features: [[0, 0, 8, 3, -1.], [4, 0, 4, 3, 2.]], threshold: -7.9851560294628143e-003, right_val: 0.4630635976791382, left_val: 0.6043018102645874 }, { features: [[15, 0, 2, 5, -1.], [15, 0, 1, 5, 2.]], threshold: 6.0594122624024749e-004, right_val: 0.5533195137977600, left_val: 0.4598254859447479 }, { features: [[4, 1, 3, 2, -1.], [5, 1, 1, 2, 3.]], threshold: -2.2983040253166109e-004, right_val: 0.5322461128234863, left_val: 0.4130752086639404 }, { features: [[7, 0, 6, 15, -1.], [9, 0, 2, 15, 3.]], threshold: 4.3740210821852088e-004, right_val: 0.5409289002418518, left_val: 0.4043039977550507 }, { features: [[6, 11, 3, 1, -1.], [7, 11, 1, 1, 3.]], threshold: 2.9482020181603730e-004, right_val: 0.5628852248191834, left_val: 0.4494963884353638 }, { features: [[12, 0, 3, 4, -1.], [13, 0, 1, 4, 3.]], threshold: 0.0103126596659422, right_val: 0.2704316973686218, left_val: 0.5177510976791382 }, { features: [[5, 4, 6, 1, -1.], [7, 4, 2, 1, 3.]], threshold: -7.7241109684109688e-003, right_val: 0.4980553984642029, left_val: 0.1988019049167633 }, { features: [[12, 7, 3, 2, -1.], [12, 8, 3, 1, 2.]], threshold: -4.6797208487987518e-003, right_val: 0.5018296241760254, left_val: 0.6644750237464905 }, { features: [[0, 1, 4, 6, -1.], [0, 4, 4, 3, 2.]], threshold: -5.0755459815263748e-003, right_val: 0.5185269117355347, left_val: 0.3898304998874664 }, { features: [[12, 7, 3, 2, -1.], [12, 8, 3, 1, 2.]], threshold: 2.2479740437120199e-003, right_val: 0.5660336017608643, left_val: 0.4801808893680573 }, { features: [[2, 16, 3, 3, -1.], [2, 17, 3, 1, 3.]], threshold: 8.3327008178457618e-004, right_val: 0.3957188129425049, left_val: 0.5210919976234436 }, { features: [[13, 8, 6, 10, -1.], [16, 8, 3, 5, 2.], [13, 13, 3, 5, 2.]], threshold: -0.0412793308496475, right_val: 0.5007054209709168, left_val: 0.6154541969299316 }, { features: [[0, 9, 5, 2, -1.], [0, 10, 5, 1, 2.]], threshold: -5.0930189900100231e-004, right_val: 0.5228403806686401, left_val: 0.3975942134857178 }, { features: [[12, 11, 2, 2, -1.], [13, 11, 1, 1, 2.], [12, 12, 1, 1, 2.]], threshold: 1.2568780221045017e-003, right_val: 0.5939183235168457, left_val: 0.4979138076305389 }, { features: [[3, 15, 3, 3, -1.], [3, 16, 3, 1, 3.]], threshold: 8.0048497766256332e-003, right_val: 0.1633366048336029, left_val: 0.4984497129917145 }, { features: [[12, 7, 3, 2, -1.], [12, 8, 3, 1, 2.]], threshold: -1.1879300000146031e-003, right_val: 0.4942624866962433, left_val: 0.5904964804649353 }, { features: [[5, 7, 3, 2, -1.], [5, 8, 3, 1, 2.]], threshold: 6.1948952497914433e-004, right_val: 0.5328726172447205, left_val: 0.4199557900428772 }, { features: [[9, 5, 9, 9, -1.], [9, 8, 9, 3, 3.]], threshold: 6.6829859279096127e-003, right_val: 0.4905889034271240, left_val: 0.5418602824211121 }, { features: [[5, 0, 3, 7, -1.], [6, 0, 1, 7, 3.]], threshold: -3.7062340416014194e-003, right_val: 0.5138000249862671, left_val: 0.3725939095020294 }, { features: [[5, 2, 12, 5, -1.], [9, 2, 4, 5, 3.]], threshold: -0.0397394113242626, right_val: 0.5050346851348877, left_val: 0.6478961110115051 }, { features: [[6, 11, 2, 2, -1.], [6, 11, 1, 1, 2.], [7, 12, 1, 1, 2.]], threshold: 1.4085009461268783e-003, right_val: 0.6377884149551392, left_val: 0.4682339131832123 }, { features: [[15, 15, 3, 2, -1.], [15, 16, 3, 1, 2.]], threshold: 3.9322688826359808e-004, right_val: 0.4150482118129730, left_val: 0.5458530187606812 }, { features: [[2, 15, 3, 2, -1.], [2, 16, 3, 1, 2.]], threshold: -1.8979819724336267e-003, right_val: 0.5149704217910767, left_val: 0.3690159916877747 }, { features: [[14, 12, 6, 8, -1.], [17, 12, 3, 4, 2.], [14, 16, 3, 4, 2.]], threshold: -0.0139704402536154, right_val: 0.4811357855796814, left_val: 0.6050562858581543 }, { features: [[2, 8, 15, 6, -1.], [7, 8, 5, 6, 3.]], threshold: -0.1010081991553307, right_val: 0.4992361962795258, left_val: 0.2017080038785934 }, { features: [[2, 2, 18, 17, -1.], [8, 2, 6, 17, 3.]], threshold: -0.0173469204455614, right_val: 0.4899486005306244, left_val: 0.5713148713111877 }, { features: [[5, 1, 4, 1, -1.], [7, 1, 2, 1, 2.]], threshold: 1.5619759506080300e-004, right_val: 0.5392642021179199, left_val: 0.4215388894081116 }, { features: [[5, 2, 12, 5, -1.], [9, 2, 4, 5, 3.]], threshold: 0.1343892961740494, right_val: 0.3767612874507904, left_val: 0.5136151909828186 }, { features: [[3, 2, 12, 5, -1.], [7, 2, 4, 5, 3.]], threshold: -0.0245822407305241, right_val: 0.4747906923294067, left_val: 0.7027357816696167 }, { features: [[4, 9, 12, 4, -1.], [10, 9, 6, 2, 2.], [4, 11, 6, 2, 2.]], threshold: -3.8553720805794001e-003, right_val: 0.5427716970443726, left_val: 0.4317409098148346 }, { features: [[5, 15, 6, 2, -1.], [5, 15, 3, 1, 2.], [8, 16, 3, 1, 2.]], threshold: -2.3165249731391668e-003, right_val: 0.4618647992610931, left_val: 0.5942698717117310 }, { features: [[10, 14, 2, 3, -1.], [10, 15, 2, 1, 3.]], threshold: -4.8518120311200619e-003, right_val: 0.4884895086288452, left_val: 0.6191568970680237 }, { features: [[0, 13, 20, 2, -1.], [0, 13, 10, 1, 2.], [10, 14, 10, 1, 2.]], threshold: 2.4699938949197531e-003, right_val: 0.4017199873924255, left_val: 0.5256664752960205 }, { features: [[4, 9, 12, 8, -1.], [10, 9, 6, 4, 2.], [4, 13, 6, 4, 2.]], threshold: 0.0454969592392445, right_val: 0.2685773968696594, left_val: 0.5237867832183838 }, { features: [[8, 13, 3, 6, -1.], [8, 16, 3, 3, 2.]], threshold: -0.0203195996582508, right_val: 0.4979738891124725, left_val: 0.2130445986986160 }, { features: [[10, 12, 2, 2, -1.], [10, 13, 2, 1, 2.]], threshold: 2.6994998916052282e-004, right_val: 0.5543122291564941, left_val: 0.4814041852951050 }, { features: [[9, 12, 2, 2, -1.], [9, 12, 1, 1, 2.], [10, 13, 1, 1, 2.]], threshold: -1.8232699949294329e-003, right_val: 0.4709989130496979, left_val: 0.6482579708099365 }, { features: [[4, 11, 14, 4, -1.], [11, 11, 7, 2, 2.], [4, 13, 7, 2, 2.]], threshold: -6.3015790656208992e-003, right_val: 0.5306236147880554, left_val: 0.4581927955150604 }, { features: [[8, 5, 4, 2, -1.], [8, 6, 4, 1, 2.]], threshold: -2.4139499873854220e-004, right_val: 0.4051763117313385, left_val: 0.5232086777687073 }, { features: [[10, 10, 6, 3, -1.], [12, 10, 2, 3, 3.]], threshold: -1.0330369696021080e-003, right_val: 0.4789193868637085, left_val: 0.5556201934814453 }, { features: [[2, 14, 1, 2, -1.], [2, 15, 1, 1, 2.]], threshold: 1.8041160365100950e-004, right_val: 0.4011810123920441, left_val: 0.5229442715644836 }, { features: [[13, 8, 6, 12, -1.], [16, 8, 3, 6, 2.], [13, 14, 3, 6, 2.]], threshold: -0.0614078603684902, right_val: 0.5010703206062317, left_val: 0.6298682093620300 }, { features: [[1, 8, 6, 12, -1.], [1, 8, 3, 6, 2.], [4, 14, 3, 6, 2.]], threshold: -0.0695439130067825, right_val: 0.4773184061050415, left_val: 0.7228280901908875 }, { features: [[10, 0, 6, 10, -1.], [12, 0, 2, 10, 3.]], threshold: -0.0705426633358002, right_val: 0.5182529091835022, left_val: 0.2269513010978699 }, { features: [[5, 11, 8, 4, -1.], [5, 11, 4, 2, 2.], [9, 13, 4, 2, 2.]], threshold: 2.4423799477517605e-003, right_val: 0.4098151028156281, left_val: 0.5237097144126892 }, { features: [[10, 16, 8, 4, -1.], [14, 16, 4, 2, 2.], [10, 18, 4, 2, 2.]], threshold: 1.5494349645450711e-003, right_val: 0.5468043088912964, left_val: 0.4773750901222229 }, { features: [[7, 7, 6, 6, -1.], [9, 7, 2, 6, 3.]], threshold: -0.0239142198115587, right_val: 0.4783824980258942, left_val: 0.7146975994110107 }, { features: [[10, 2, 4, 10, -1.], [10, 2, 2, 10, 2.]], threshold: -0.0124536901712418, right_val: 0.5241122841835022, left_val: 0.2635296881198883 }, { features: [[6, 1, 4, 9, -1.], [8, 1, 2, 9, 2.]], threshold: -2.0760179904755205e-004, right_val: 0.5113608837127686, left_val: 0.3623757064342499 }, { features: [[12, 19, 2, 1, -1.], [12, 19, 1, 1, 2.]], threshold: 2.9781080229440704e-005, right_val: 0.5432801842689514, left_val: 0.4705932140350342 }], threshold: 90.2533493041992190 }, { simpleClassifiers: [{ features: [[1, 2, 4, 9, -1.], [3, 2, 2, 9, 2.]], threshold: 0.0117727499455214, right_val: 0.6421167254447937, left_val: 0.3860518932342529 }, { features: [[7, 5, 6, 4, -1.], [9, 5, 2, 4, 3.]], threshold: 0.0270375702530146, right_val: 0.6754038929939270, left_val: 0.4385654926300049 }, { features: [[9, 4, 2, 4, -1.], [9, 6, 2, 2, 2.]], threshold: -3.6419500247575343e-005, right_val: 0.3423315882682800, left_val: 0.5487101078033447 }, { features: [[14, 5, 2, 8, -1.], [14, 9, 2, 4, 2.]], threshold: 1.9995409529656172e-003, right_val: 0.5400317907333374, left_val: 0.3230532109737396 }, { features: [[7, 6, 5, 12, -1.], [7, 12, 5, 6, 2.]], threshold: 4.5278300531208515e-003, right_val: 0.2935043871402741, left_val: 0.5091639757156372 }, { features: [[14, 6, 2, 6, -1.], [14, 9, 2, 3, 2.]], threshold: 4.7890920541249216e-004, right_val: 0.5344064235687256, left_val: 0.4178153872489929 }, { features: [[4, 6, 2, 6, -1.], [4, 9, 2, 3, 2.]], threshold: 1.1720920447260141e-003, right_val: 0.5132070779800415, left_val: 0.2899182140827179 }, { features: [[8, 15, 10, 4, -1.], [13, 15, 5, 2, 2.], [8, 17, 5, 2, 2.]], threshold: 9.5305702416226268e-004, right_val: 0.5560845136642456, left_val: 0.4280124902725220 }, { features: [[6, 18, 2, 2, -1.], [7, 18, 1, 2, 2.]], threshold: 1.5099150004971307e-005, right_val: 0.5404760241508484, left_val: 0.4044871926307678 }, { features: [[11, 3, 6, 2, -1.], [11, 4, 6, 1, 2.]], threshold: -6.0817901976406574e-004, right_val: 0.5503466129302979, left_val: 0.4271768927574158 }, { features: [[2, 0, 16, 6, -1.], [2, 2, 16, 2, 3.]], threshold: 3.3224520739167929e-003, right_val: 0.5369734764099121, left_val: 0.3962723910808563 }, { features: [[11, 3, 6, 2, -1.], [11, 4, 6, 1, 2.]], threshold: -1.1037490330636501e-003, right_val: 0.5237749814987183, left_val: 0.4727177917957306 }, { features: [[4, 11, 10, 3, -1.], [4, 12, 10, 1, 3.]], threshold: -1.4350269921123981e-003, right_val: 0.4223509132862091, left_val: 0.5603008270263672 }, { features: [[11, 3, 6, 2, -1.], [11, 4, 6, 1, 2.]], threshold: 2.0767399109899998e-003, right_val: 0.4732725918292999, left_val: 0.5225917100906372 }, { features: [[3, 3, 6, 2, -1.], [3, 4, 6, 1, 2.]], threshold: -1.6412809782195836e-004, right_val: 0.5432739853858948, left_val: 0.3999075889587402 }, { features: [[16, 0, 4, 7, -1.], [16, 0, 2, 7, 2.]], threshold: 8.8302437216043472e-003, right_val: 0.6027327179908752, left_val: 0.4678385853767395 }, { features: [[0, 14, 9, 6, -1.], [0, 16, 9, 2, 3.]], threshold: -0.0105520701035857, right_val: 0.5213974714279175, left_val: 0.3493967056274414 }, { features: [[9, 16, 3, 3, -1.], [9, 17, 3, 1, 3.]], threshold: -2.2731600329279900e-003, right_val: 0.4749062955379486, left_val: 0.6185818910598755 }, { features: [[4, 6, 6, 2, -1.], [6, 6, 2, 2, 3.]], threshold: -8.4786332445219159e-004, right_val: 0.3843482136726379, left_val: 0.5285341143608093 }, { features: [[15, 11, 1, 3, -1.], [15, 12, 1, 1, 3.]], threshold: 1.2081359745934606e-003, right_val: 0.3447335958480835, left_val: 0.5360640883445740 }, { features: [[5, 5, 2, 3, -1.], [5, 6, 2, 1, 3.]], threshold: 2.6512730401009321e-003, right_val: 0.6193962097167969, left_val: 0.4558292031288147 }, { features: [[10, 9, 2, 2, -1.], [10, 10, 2, 1, 2.]], threshold: -1.1012479662895203e-003, right_val: 0.5327628254890442, left_val: 0.3680230081081390 }, { features: [[3, 1, 4, 3, -1.], [5, 1, 2, 3, 2.]], threshold: 4.9561518244445324e-004, right_val: 0.5274940729141235, left_val: 0.3960595130920410 }, { features: [[16, 0, 4, 7, -1.], [16, 0, 2, 7, 2.]], threshold: -0.0439017713069916, right_val: 0.4992839097976685, left_val: 0.7020444869995117 }, { features: [[0, 0, 20, 1, -1.], [10, 0, 10, 1, 2.]], threshold: 0.0346903502941132, right_val: 0.2766602933406830, left_val: 0.5049164295196533 }, { features: [[15, 11, 1, 3, -1.], [15, 12, 1, 1, 3.]], threshold: -2.7442190330475569e-003, right_val: 0.5274971127510071, left_val: 0.2672632932662964 }, { features: [[0, 4, 3, 4, -1.], [1, 4, 1, 4, 3.]], threshold: 3.3316588960587978e-003, right_val: 0.6001101732254028, left_val: 0.4579482972621918 }, { features: [[16, 3, 3, 6, -1.], [16, 5, 3, 2, 3.]], threshold: -0.0200445707887411, right_val: 0.5235717892646790, left_val: 0.3171594142913818 }, { features: [[1, 3, 3, 6, -1.], [1, 5, 3, 2, 3.]], threshold: 1.3492030557245016e-003, right_val: 0.4034324884414673, left_val: 0.5265362858772278 }, { features: [[6, 2, 12, 6, -1.], [12, 2, 6, 3, 2.], [6, 5, 6, 3, 2.]], threshold: 2.9702018946409225e-003, right_val: 0.4571984112262726, left_val: 0.5332456827163696 }, { features: [[8, 10, 4, 3, -1.], [8, 11, 4, 1, 3.]], threshold: 6.3039981760084629e-003, right_val: 0.6034635901451111, left_val: 0.4593310952186585 }, { features: [[4, 2, 14, 6, -1.], [11, 2, 7, 3, 2.], [4, 5, 7, 3, 2.]], threshold: -0.0129365902394056, right_val: 0.5372971296310425, left_val: 0.4437963962554932 }, { features: [[9, 11, 2, 3, -1.], [9, 12, 2, 1, 3.]], threshold: 4.0148729458451271e-003, right_val: 0.6437833905220032, left_val: 0.4680323898792267 }, { features: [[15, 13, 2, 3, -1.], [15, 14, 2, 1, 3.]], threshold: -2.6401679497212172e-003, right_val: 0.5314332842826843, left_val: 0.3709631860256195 }, { features: [[8, 12, 4, 3, -1.], [8, 13, 4, 1, 3.]], threshold: 0.0139184398576617, right_val: 0.7130808830261231, left_val: 0.4723555147647858 }, { features: [[15, 11, 1, 3, -1.], [15, 12, 1, 1, 3.]], threshold: -4.5087869511917233e-004, right_val: 0.5370404124259949, left_val: 0.4492394030094147 }, { features: [[7, 13, 5, 2, -1.], [7, 14, 5, 1, 2.]], threshold: 2.5384349282830954e-004, right_val: 0.5514402985572815, left_val: 0.4406864047050476 }, { features: [[7, 12, 6, 3, -1.], [7, 13, 6, 1, 3.]], threshold: 2.2710000630468130e-003, right_val: 0.5967984199523926, left_val: 0.4682416915893555 }, { features: [[5, 11, 4, 4, -1.], [5, 13, 4, 2, 2.]], threshold: 2.4120779708027840e-003, right_val: 0.3018598854541779, left_val: 0.5079392194747925 }, { features: [[11, 4, 3, 3, -1.], [12, 4, 1, 3, 3.]], threshold: -3.6025670851813629e-005, right_val: 0.4471096992492676, left_val: 0.5601037144660950 }, { features: [[6, 4, 3, 3, -1.], [7, 4, 1, 3, 3.]], threshold: -7.4905529618263245e-003, right_val: 0.4989944100379944, left_val: 0.2207535058259964 }, { features: [[16, 5, 3, 6, -1.], [17, 5, 1, 6, 3.]], threshold: -0.0175131205469370, right_val: 0.5017648935317993, left_val: 0.6531215906143189 }, { features: [[3, 6, 12, 7, -1.], [7, 6, 4, 7, 3.]], threshold: 0.1428163051605225, right_val: 0.1482062041759491, left_val: 0.4967963099479675 }, { features: [[16, 5, 3, 6, -1.], [17, 5, 1, 6, 3.]], threshold: 5.5345268920063972e-003, right_val: 0.5954223871231079, left_val: 0.4898946881294251 }, { features: [[3, 13, 2, 3, -1.], [3, 14, 2, 1, 3.]], threshold: -9.6323591424152255e-004, right_val: 0.5196074247360230, left_val: 0.3927116990089417 }, { features: [[16, 5, 3, 6, -1.], [17, 5, 1, 6, 3.]], threshold: -2.0370010752230883e-003, right_val: 0.4884858131408691, left_val: 0.5613325238227844 }, { features: [[1, 5, 3, 6, -1.], [2, 5, 1, 6, 3.]], threshold: 1.6614829655736685e-003, right_val: 0.5578880906105042, left_val: 0.4472880065441132 }, { features: [[1, 9, 18, 1, -1.], [7, 9, 6, 1, 3.]], threshold: -3.1188090797513723e-003, right_val: 0.5397477746009827, left_val: 0.3840532898902893 }, { features: [[0, 9, 8, 7, -1.], [4, 9, 4, 7, 2.]], threshold: -6.4000617712736130e-003, right_val: 0.4533218145370483, left_val: 0.5843983888626099 }, { features: [[12, 11, 8, 2, -1.], [12, 12, 8, 1, 2.]], threshold: 3.1319601112045348e-004, right_val: 0.4234727919101715, left_val: 0.5439221858978272 }, { features: [[0, 11, 8, 2, -1.], [0, 12, 8, 1, 2.]], threshold: -0.0182220991700888, right_val: 0.4958404898643494, left_val: 0.1288464963436127 }, { features: [[9, 13, 2, 3, -1.], [9, 14, 2, 1, 3.]], threshold: 8.7969247251749039e-003, right_val: 0.7153480052947998, left_val: 0.4951297938823700 }, { features: [[4, 10, 12, 4, -1.], [4, 10, 6, 2, 2.], [10, 12, 6, 2, 2.]], threshold: -4.2395070195198059e-003, right_val: 0.5194936990737915, left_val: 0.3946599960327148 }, { features: [[9, 3, 3, 7, -1.], [10, 3, 1, 7, 3.]], threshold: 9.7086271271109581e-003, right_val: 0.6064900159835815, left_val: 0.4897503852844238 }, { features: [[7, 2, 3, 5, -1.], [8, 2, 1, 5, 3.]], threshold: -3.9934171363711357e-003, right_val: 0.5060828924179077, left_val: 0.3245440125465393 }, { features: [[9, 12, 4, 6, -1.], [11, 12, 2, 3, 2.], [9, 15, 2, 3, 2.]], threshold: -0.0167850591242313, right_val: 0.5203778743743897, left_val: 0.1581953018903732 }, { features: [[8, 7, 3, 6, -1.], [9, 7, 1, 6, 3.]], threshold: 0.0182720907032490, right_val: 0.6626979112625122, left_val: 0.4680935144424439 }, { features: [[15, 4, 4, 2, -1.], [15, 5, 4, 1, 2.]], threshold: 5.6872838176786900e-003, right_val: 0.3512184917926788, left_val: 0.5211697816848755 }, { features: [[8, 7, 3, 3, -1.], [9, 7, 1, 3, 3.]], threshold: -1.0739039862528443e-003, right_val: 0.4529845118522644, left_val: 0.5768386125564575 }, { features: [[14, 2, 6, 4, -1.], [14, 4, 6, 2, 2.]], threshold: -3.7093870341777802e-003, right_val: 0.5313581228256226, left_val: 0.4507763087749481 }, { features: [[7, 16, 6, 1, -1.], [9, 16, 2, 1, 3.]], threshold: -2.1110709349159151e-004, right_val: 0.4333376884460449, left_val: 0.5460820198059082 }, { features: [[15, 13, 2, 3, -1.], [15, 14, 2, 1, 3.]], threshold: 1.0670139454305172e-003, right_val: 0.4078390896320343, left_val: 0.5371856093406677 }, { features: [[8, 7, 3, 10, -1.], [9, 7, 1, 10, 3.]], threshold: 3.5943021066486835e-003, right_val: 0.5643836259841919, left_val: 0.4471287131309509 }, { features: [[11, 10, 2, 6, -1.], [11, 12, 2, 2, 3.]], threshold: -5.1776031032204628e-003, right_val: 0.5280330181121826, left_val: 0.4499393105506897 }, { features: [[6, 10, 4, 1, -1.], [8, 10, 2, 1, 2.]], threshold: -2.5414369883947074e-004, right_val: 0.4407708048820496, left_val: 0.5516173243522644 }, { features: [[10, 9, 2, 2, -1.], [10, 10, 2, 1, 2.]], threshold: 6.3522560521960258e-003, right_val: 0.2465227991342545, left_val: 0.5194190144538879 }, { features: [[8, 9, 2, 2, -1.], [8, 10, 2, 1, 2.]], threshold: -4.4205080484971404e-004, right_val: 0.5139682292938232, left_val: 0.3830705881118774 }, { features: [[12, 7, 2, 2, -1.], [13, 7, 1, 1, 2.], [12, 8, 1, 1, 2.]], threshold: 7.4488727841526270e-004, right_val: 0.5974786877632141, left_val: 0.4891090989112854 }, { features: [[5, 7, 2, 2, -1.], [5, 7, 1, 1, 2.], [6, 8, 1, 1, 2.]], threshold: -3.5116379149258137e-003, right_val: 0.4768764972686768, left_val: 0.7413681745529175 }, { features: [[13, 0, 3, 14, -1.], [14, 0, 1, 14, 3.]], threshold: -0.0125409103929996, right_val: 0.5252826809883118, left_val: 0.3648819029331207 }, { features: [[4, 0, 3, 14, -1.], [5, 0, 1, 14, 3.]], threshold: 9.4931852072477341e-003, right_val: 0.3629586994647980, left_val: 0.5100492835044861 }, { features: [[13, 4, 3, 14, -1.], [14, 4, 1, 14, 3.]], threshold: 0.0129611501470208, right_val: 0.4333561062812805, left_val: 0.5232442021369934 }, { features: [[9, 14, 2, 3, -1.], [9, 15, 2, 1, 3.]], threshold: 4.7209449112415314e-003, right_val: 0.6331052780151367, left_val: 0.4648149013519287 }, { features: [[8, 14, 4, 3, -1.], [8, 15, 4, 1, 3.]], threshold: -2.3119079414755106e-003, right_val: 0.4531058073043823, left_val: 0.5930309891700745 }, { features: [[4, 2, 3, 16, -1.], [5, 2, 1, 16, 3.]], threshold: -2.8262299019843340e-003, right_val: 0.5257101058959961, left_val: 0.3870477974414825 }, { features: [[7, 2, 8, 10, -1.], [7, 7, 8, 5, 2.]], threshold: -1.4311339473351836e-003, right_val: 0.4561854898929596, left_val: 0.5522503256797791 }, { features: [[6, 14, 7, 3, -1.], [6, 15, 7, 1, 3.]], threshold: 1.9378310535103083e-003, right_val: 0.5736966729164124, left_val: 0.4546220898628235 }, { features: [[9, 2, 10, 12, -1.], [14, 2, 5, 6, 2.], [9, 8, 5, 6, 2.]], threshold: 2.6343559147790074e-004, right_val: 0.4571875035762787, left_val: 0.5345739126205444 }, { features: [[6, 7, 8, 2, -1.], [6, 8, 8, 1, 2.]], threshold: 7.8257522545754910e-004, right_val: 0.5220187902450562, left_val: 0.3967815935611725 }, { features: [[8, 13, 4, 6, -1.], [8, 16, 4, 3, 2.]], threshold: -0.0195504408329725, right_val: 0.5243508219718933, left_val: 0.2829642891883850 }, { features: [[6, 6, 1, 3, -1.], [6, 7, 1, 1, 3.]], threshold: 4.3914958951063454e-004, right_val: 0.5899090170860291, left_val: 0.4590066969394684 }, { features: [[16, 2, 4, 6, -1.], [16, 4, 4, 2, 3.]], threshold: 0.0214520003646612, right_val: 0.2855378985404968, left_val: 0.5231410861015320 }, { features: [[6, 6, 4, 2, -1.], [6, 6, 2, 1, 2.], [8, 7, 2, 1, 2.]], threshold: 5.8973580598831177e-004, right_val: 0.5506421923637390, left_val: 0.4397256970405579 }, { features: [[16, 2, 4, 6, -1.], [16, 4, 4, 2, 3.]], threshold: -0.0261576101183891, right_val: 0.5189175009727478, left_val: 0.3135079145431519 }, { features: [[0, 2, 4, 6, -1.], [0, 4, 4, 2, 3.]], threshold: -0.0139598604291677, right_val: 0.5040717720985413, left_val: 0.3213272988796234 }, { features: [[9, 6, 2, 6, -1.], [9, 6, 1, 6, 2.]], threshold: -6.3699018210172653e-003, right_val: 0.4849506914615631, left_val: 0.6387544870376587 }, { features: [[3, 4, 6, 10, -1.], [3, 9, 6, 5, 2.]], threshold: -8.5613820701837540e-003, right_val: 0.5032019019126892, left_val: 0.2759132087230682 }, { features: [[9, 5, 2, 6, -1.], [9, 5, 1, 6, 2.]], threshold: 9.6622901037335396e-004, right_val: 0.5834879279136658, left_val: 0.4685640931129456 }, { features: [[3, 13, 2, 3, -1.], [3, 14, 2, 1, 3.]], threshold: 7.6550268568098545e-004, right_val: 0.3896422088146210, left_val: 0.5175207257270813 }, { features: [[13, 13, 3, 2, -1.], [13, 14, 3, 1, 2.]], threshold: -8.1833340227603912e-003, right_val: 0.5208122134208679, left_val: 0.2069136947393417 }, { features: [[2, 16, 10, 4, -1.], [2, 16, 5, 2, 2.], [7, 18, 5, 2, 2.]], threshold: -9.3976939097046852e-003, right_val: 0.4641222953796387, left_val: 0.6134091019630432 }, { features: [[5, 6, 10, 6, -1.], [10, 6, 5, 3, 2.], [5, 9, 5, 3, 2.]], threshold: 4.8028980381786823e-003, right_val: 0.4395219981670380, left_val: 0.5454108119010925 }, { features: [[7, 14, 1, 3, -1.], [7, 15, 1, 1, 3.]], threshold: -3.5680569708347321e-003, right_val: 0.4681093990802765, left_val: 0.6344485282897949 }, { features: [[14, 16, 6, 3, -1.], [14, 17, 6, 1, 3.]], threshold: 4.0733120404183865e-003, right_val: 0.4015620052814484, left_val: 0.5292683243751526 }, { features: [[5, 4, 3, 3, -1.], [5, 5, 3, 1, 3.]], threshold: 1.2568129459396005e-003, right_val: 0.5452824831008911, left_val: 0.4392988085746765 }, { features: [[7, 4, 10, 3, -1.], [7, 5, 10, 1, 3.]], threshold: -2.9065010603517294e-003, right_val: 0.4863379895687103, left_val: 0.5898832082748413 }, { features: [[0, 4, 5, 4, -1.], [0, 6, 5, 2, 2.]], threshold: -2.4409340694546700e-003, right_val: 0.5247421860694885, left_val: 0.4069364964962006 }, { features: [[13, 11, 3, 9, -1.], [13, 14, 3, 3, 3.]], threshold: 0.0248307008296251, right_val: 0.3682524859905243, left_val: 0.5182725787162781 }, { features: [[4, 11, 3, 9, -1.], [4, 14, 3, 3, 3.]], threshold: -0.0488540083169937, right_val: 0.4961281120777130, left_val: 0.1307577937841415 }, { features: [[9, 7, 2, 1, -1.], [9, 7, 1, 1, 2.]], threshold: -1.6110379947349429e-003, right_val: 0.4872662127017975, left_val: 0.6421005725860596 }, { features: [[5, 0, 6, 17, -1.], [7, 0, 2, 17, 3.]], threshold: -0.0970094799995422, right_val: 0.4950988888740540, left_val: 0.0477693490684032 }, { features: [[10, 3, 6, 3, -1.], [10, 3, 3, 3, 2.]], threshold: 1.1209240183234215e-003, right_val: 0.5354745984077454, left_val: 0.4616267085075378 }, { features: [[2, 2, 15, 4, -1.], [7, 2, 5, 4, 3.]], threshold: -1.3064090162515640e-003, right_val: 0.4638805985450745, left_val: 0.6261854171752930 }, { features: [[8, 2, 8, 2, -1.], [12, 2, 4, 1, 2.], [8, 3, 4, 1, 2.]], threshold: 4.5771620352752507e-004, right_val: 0.4646640121936798, left_val: 0.5384417772293091 }, { features: [[8, 1, 3, 6, -1.], [8, 3, 3, 2, 3.]], threshold: -6.3149951165542006e-004, right_val: 0.5130257010459900, left_val: 0.3804047107696533 }, { features: [[9, 17, 2, 2, -1.], [9, 18, 2, 1, 2.]], threshold: 1.4505970466416329e-004, right_val: 0.5664461851119995, left_val: 0.4554310142993927 }, { features: [[0, 0, 2, 14, -1.], [1, 0, 1, 14, 2.]], threshold: -0.0164745505899191, right_val: 0.4715859889984131, left_val: 0.6596958041191101 }, { features: [[12, 0, 7, 3, -1.], [12, 1, 7, 1, 3.]], threshold: 0.0133695797994733, right_val: 0.3035964965820313, left_val: 0.5195466279983521 }, { features: [[1, 14, 1, 2, -1.], [1, 15, 1, 1, 2.]], threshold: 1.0271780047332868e-004, right_val: 0.4107066094875336, left_val: 0.5229176282882690 }, { features: [[14, 12, 2, 8, -1.], [15, 12, 1, 4, 2.], [14, 16, 1, 4, 2.]], threshold: -5.5311559699475765e-003, right_val: 0.4960907101631165, left_val: 0.6352887749671936 }, { features: [[1, 0, 7, 3, -1.], [1, 1, 7, 1, 3.]], threshold: -2.6187049224972725e-003, right_val: 0.5140984058380127, left_val: 0.3824546039104462 }, { features: [[14, 12, 2, 8, -1.], [15, 12, 1, 4, 2.], [14, 16, 1, 4, 2.]], threshold: 5.0834268331527710e-003, right_val: 0.6220818758010864, left_val: 0.4950439929962158 }, { features: [[6, 0, 8, 12, -1.], [6, 0, 4, 6, 2.], [10, 6, 4, 6, 2.]], threshold: 0.0798181593418121, right_val: 0.1322475969791412, left_val: 0.4952335953712463 }, { features: [[6, 1, 8, 9, -1.], [6, 4, 8, 3, 3.]], threshold: -0.0992265865206718, right_val: 0.5008416771888733, left_val: 0.7542728781700134 }, { features: [[5, 2, 2, 2, -1.], [5, 3, 2, 1, 2.]], threshold: -6.5174017800018191e-004, right_val: 0.5130121111869812, left_val: 0.3699302971363068 }, { features: [[13, 14, 6, 6, -1.], [16, 14, 3, 3, 2.], [13, 17, 3, 3, 2.]], threshold: -0.0189968496561050, right_val: 0.4921202957630158, left_val: 0.6689178943634033 }, { features: [[0, 17, 20, 2, -1.], [0, 17, 10, 1, 2.], [10, 18, 10, 1, 2.]], threshold: 0.0173468999564648, right_val: 0.1859198063611984, left_val: 0.4983300864696503 }, { features: [[10, 3, 2, 6, -1.], [11, 3, 1, 3, 2.], [10, 6, 1, 3, 2.]], threshold: 5.5082101607695222e-004, right_val: 0.5522121787071228, left_val: 0.4574424028396606 }, { features: [[5, 12, 6, 2, -1.], [8, 12, 3, 2, 2.]], threshold: 2.0056050270795822e-003, right_val: 0.3856469988822937, left_val: 0.5131744742393494 }, { features: [[10, 7, 6, 13, -1.], [10, 7, 3, 13, 2.]], threshold: -7.7688191086053848e-003, right_val: 0.5434309244155884, left_val: 0.4361700117588043 }, { features: [[5, 15, 10, 5, -1.], [10, 15, 5, 5, 2.]], threshold: 0.0508782789111137, right_val: 0.6840639710426331, left_val: 0.4682720899581909 }, { features: [[10, 4, 4, 10, -1.], [10, 4, 2, 10, 2.]], threshold: -2.2901780903339386e-003, right_val: 0.5306099057197571, left_val: 0.4329245090484619 }, { features: [[5, 7, 2, 1, -1.], [6, 7, 1, 1, 2.]], threshold: -1.5715380141045898e-004, right_val: 0.4378164112567902, left_val: 0.5370057225227356 }, { features: [[10, 3, 6, 7, -1.], [10, 3, 3, 7, 2.]], threshold: 0.1051924005150795, right_val: 0.0673614665865898, left_val: 0.5137274265289307 }, { features: [[4, 3, 6, 7, -1.], [7, 3, 3, 7, 2.]], threshold: 2.7198919560760260e-003, right_val: 0.5255665183067322, left_val: 0.4112060964107513 }, { features: [[1, 7, 18, 5, -1.], [7, 7, 6, 5, 3.]], threshold: 0.0483377799391747, right_val: 0.4438967108726502, left_val: 0.5404623746871948 }, { features: [[3, 17, 4, 3, -1.], [5, 17, 2, 3, 2.]], threshold: 9.5703761326149106e-004, right_val: 0.5399510860443115, left_val: 0.4355969130992889 }, { features: [[8, 14, 12, 6, -1.], [14, 14, 6, 3, 2.], [8, 17, 6, 3, 2.]], threshold: -0.0253712590783834, right_val: 0.5031024813652039, left_val: 0.5995175242424011 }, { features: [[0, 13, 20, 4, -1.], [0, 13, 10, 2, 2.], [10, 15, 10, 2, 2.]], threshold: 0.0524579510092735, right_val: 0.1398351043462753, left_val: 0.4950287938117981 }, { features: [[4, 5, 14, 2, -1.], [11, 5, 7, 1, 2.], [4, 6, 7, 1, 2.]], threshold: -0.0123656298965216, right_val: 0.4964106082916260, left_val: 0.6397299170494080 }, { features: [[1, 2, 10, 12, -1.], [1, 2, 5, 6, 2.], [6, 8, 5, 6, 2.]], threshold: -0.1458971947431564, right_val: 0.4946322143077850, left_val: 0.1001669988036156 }, { features: [[6, 1, 14, 3, -1.], [6, 2, 14, 1, 3.]], threshold: -0.0159086007624865, right_val: 0.5208340883255005, left_val: 0.3312329947948456 }, { features: [[8, 16, 2, 3, -1.], [8, 17, 2, 1, 3.]], threshold: 3.9486068999394774e-004, right_val: 0.5426102876663208, left_val: 0.4406363964080811 }, { features: [[9, 17, 3, 2, -1.], [10, 17, 1, 2, 3.]], threshold: -5.2454001270234585e-003, right_val: 0.5189967155456543, left_val: 0.2799589931964874 }, { features: [[5, 15, 4, 2, -1.], [5, 15, 2, 1, 2.], [7, 16, 2, 1, 2.]], threshold: -5.0421799533069134e-003, right_val: 0.4752142131328583, left_val: 0.6987580060958862 }, { features: [[10, 15, 1, 3, -1.], [10, 16, 1, 1, 3.]], threshold: 2.9812189750373363e-003, right_val: 0.6307479739189148, left_val: 0.4983288943767548 }, { features: [[8, 16, 4, 4, -1.], [8, 16, 2, 2, 2.], [10, 18, 2, 2, 2.]], threshold: -7.2884308174252510e-003, right_val: 0.5026869773864746, left_val: 0.2982333004474640 }, { features: [[6, 11, 8, 6, -1.], [6, 14, 8, 3, 2.]], threshold: 1.5094350092113018e-003, right_val: 0.3832970857620239, left_val: 0.5308442115783691 }, { features: [[2, 13, 5, 2, -1.], [2, 14, 5, 1, 2.]], threshold: -9.3340799212455750e-003, right_val: 0.4969817101955414, left_val: 0.2037964016199112 }, { features: [[13, 14, 6, 6, -1.], [16, 14, 3, 3, 2.], [13, 17, 3, 3, 2.]], threshold: 0.0286671407520771, right_val: 0.6928027272224426, left_val: 0.5025696754455566 }, { features: [[1, 9, 18, 4, -1.], [7, 9, 6, 4, 3.]], threshold: 0.1701968014240265, right_val: 0.1476442962884903, left_val: 0.4960052967071533 }, { features: [[13, 14, 6, 6, -1.], [16, 14, 3, 3, 2.], [13, 17, 3, 3, 2.]], threshold: -3.2614478841423988e-003, right_val: 0.4826056063175201, left_val: 0.5603063702583313 }, { features: [[0, 2, 1, 6, -1.], [0, 4, 1, 2, 3.]], threshold: 5.5769277969375253e-004, right_val: 0.4129633009433746, left_val: 0.5205562114715576 }, { features: [[5, 0, 15, 20, -1.], [5, 10, 15, 10, 2.]], threshold: 0.3625833988189697, right_val: 0.3768612146377564, left_val: 0.5221652984619141 }, { features: [[1, 14, 6, 6, -1.], [1, 14, 3, 3, 2.], [4, 17, 3, 3, 2.]], threshold: -0.0116151301190257, right_val: 0.4637489914894104, left_val: 0.6022682785987854 }, { features: [[8, 14, 4, 6, -1.], [10, 14, 2, 3, 2.], [8, 17, 2, 3, 2.]], threshold: -4.0795197710394859e-003, right_val: 0.5337479114532471, left_val: 0.4070447087287903 }, { features: [[7, 11, 2, 1, -1.], [8, 11, 1, 1, 2.]], threshold: 5.7204300537705421e-004, right_val: 0.5900393128395081, left_val: 0.4601835012435913 }, { features: [[9, 17, 3, 2, -1.], [10, 17, 1, 2, 3.]], threshold: 6.7543348995968699e-004, right_val: 0.4345428943634033, left_val: 0.5398252010345459 }, { features: [[8, 17, 3, 2, -1.], [9, 17, 1, 2, 3.]], threshold: 6.3295697327703238e-004, right_val: 0.4051358997821808, left_val: 0.5201563239097595 }, { features: [[12, 14, 4, 6, -1.], [14, 14, 2, 3, 2.], [12, 17, 2, 3, 2.]], threshold: 1.2435320531949401e-003, right_val: 0.5547441244125366, left_val: 0.4642387926578522 }, { features: [[4, 14, 4, 6, -1.], [4, 14, 2, 3, 2.], [6, 17, 2, 3, 2.]], threshold: -4.7363857738673687e-003, right_val: 0.4672552049160004, left_val: 0.6198567152023315 }, { features: [[13, 14, 2, 6, -1.], [14, 14, 1, 3, 2.], [13, 17, 1, 3, 2.]], threshold: -6.4658462069928646e-003, right_val: 0.5019000768661499, left_val: 0.6837332844734192 }, { features: [[5, 14, 2, 6, -1.], [5, 14, 1, 3, 2.], [6, 17, 1, 3, 2.]], threshold: 3.5017321351915598e-004, right_val: 0.5363622903823853, left_val: 0.4344803094863892 }, { features: [[7, 0, 6, 12, -1.], [7, 4, 6, 4, 3.]], threshold: 1.5754920605104417e-004, right_val: 0.5732020735740662, left_val: 0.4760079085826874 }, { features: [[0, 7, 12, 2, -1.], [4, 7, 4, 2, 3.]], threshold: 9.9774366244673729e-003, right_val: 0.3635039925575256, left_val: 0.5090985894203186 }, { features: [[10, 3, 3, 13, -1.], [11, 3, 1, 13, 3.]], threshold: -4.1464529931545258e-004, right_val: 0.4593802094459534, left_val: 0.5570064783096314 }, { features: [[7, 3, 3, 13, -1.], [8, 3, 1, 13, 3.]], threshold: -3.5888899583369493e-004, right_val: 0.4339134991168976, left_val: 0.5356845855712891 }, { features: [[10, 8, 6, 3, -1.], [10, 9, 6, 1, 3.]], threshold: 4.0463250479660928e-004, right_val: 0.5436776876449585, left_val: 0.4439803063869476 }, { features: [[3, 11, 3, 2, -1.], [4, 11, 1, 2, 3.]], threshold: -8.2184787606820464e-004, right_val: 0.5176299214363098, left_val: 0.4042294919490814 }, { features: [[13, 12, 6, 8, -1.], [16, 12, 3, 4, 2.], [13, 16, 3, 4, 2.]], threshold: 5.9467419050633907e-003, right_val: 0.5633779764175415, left_val: 0.4927651882171631 }, { features: [[7, 6, 6, 5, -1.], [9, 6, 2, 5, 3.]], threshold: -0.0217533893883228, right_val: 0.4800840914249420, left_val: 0.8006293773651123 }, { features: [[17, 11, 2, 7, -1.], [17, 11, 1, 7, 2.]], threshold: -0.0145403798669577, right_val: 0.5182222723960877, left_val: 0.3946054875850678 }, { features: [[3, 13, 8, 2, -1.], [7, 13, 4, 2, 2.]], threshold: -0.0405107699334621, right_val: 0.4935792982578278, left_val: 0.0213249903172255 }, { features: [[6, 9, 8, 3, -1.], [6, 10, 8, 1, 3.]], threshold: -5.8458268176764250e-004, right_val: 0.5314025282859802, left_val: 0.4012795984745026 }, { features: [[4, 3, 4, 3, -1.], [4, 4, 4, 1, 3.]], threshold: 5.5151800625026226e-003, right_val: 0.5896260738372803, left_val: 0.4642418920993805 }, { features: [[11, 3, 4, 3, -1.], [11, 4, 4, 1, 3.]], threshold: -6.0626221820712090e-003, right_val: 0.5016477704048157, left_val: 0.6502159237861633 }, { features: [[1, 4, 17, 12, -1.], [1, 8, 17, 4, 3.]], threshold: 0.0945358425378799, right_val: 0.4126827120780945, left_val: 0.5264708995819092 }, { features: [[11, 3, 4, 3, -1.], [11, 4, 4, 1, 3.]], threshold: 4.7315051779150963e-003, right_val: 0.5892447829246521, left_val: 0.4879199862480164 }, { features: [[4, 8, 6, 3, -1.], [4, 9, 6, 1, 3.]], threshold: -5.2571471314877272e-004, right_val: 0.5189412832260132, left_val: 0.3917280137538910 }, { features: [[12, 3, 5, 3, -1.], [12, 4, 5, 1, 3.]], threshold: -2.5464049540460110e-003, right_val: 0.4985705912113190, left_val: 0.5837599039077759 }, { features: [[1, 11, 2, 7, -1.], [2, 11, 1, 7, 2.]], threshold: -0.0260756891220808, right_val: 0.4955821931362152, left_val: 0.1261983960866928 }, { features: [[15, 12, 2, 8, -1.], [16, 12, 1, 4, 2.], [15, 16, 1, 4, 2.]], threshold: -5.4779709316790104e-003, right_val: 0.5010265707969666, left_val: 0.5722513794898987 }, { features: [[4, 8, 11, 3, -1.], [4, 9, 11, 1, 3.]], threshold: 5.1337741315364838e-003, right_val: 0.4226376116275787, left_val: 0.5273262262344360 }, { features: [[9, 13, 6, 2, -1.], [12, 13, 3, 1, 2.], [9, 14, 3, 1, 2.]], threshold: 4.7944980906322598e-004, right_val: 0.5819587111473084, left_val: 0.4450066983699799 }, { features: [[6, 13, 4, 3, -1.], [6, 14, 4, 1, 3.]], threshold: -2.1114079281687737e-003, right_val: 0.4511714875698090, left_val: 0.5757653117179871 }, { features: [[9, 12, 3, 3, -1.], [10, 12, 1, 3, 3.]], threshold: -0.0131799904629588, right_val: 0.5160734057426453, left_val: 0.1884381026029587 }, { features: [[5, 3, 3, 3, -1.], [5, 4, 3, 1, 3.]], threshold: -4.7968099825084209e-003, right_val: 0.4736118912696838, left_val: 0.6589789986610413 }, { features: [[9, 4, 2, 3, -1.], [9, 5, 2, 1, 3.]], threshold: 6.7483168095350266e-003, right_val: 0.3356395065784454, left_val: 0.5259429812431335 }, { features: [[0, 2, 16, 3, -1.], [0, 3, 16, 1, 3.]], threshold: 1.4623369788751006e-003, right_val: 0.4264092147350311, left_val: 0.5355271100997925 }, { features: [[15, 12, 2, 8, -1.], [16, 12, 1, 4, 2.], [15, 16, 1, 4, 2.]], threshold: 4.7645159065723419e-003, right_val: 0.5786827802658081, left_val: 0.5034406781196594 }, { features: [[3, 12, 2, 8, -1.], [3, 12, 1, 4, 2.], [4, 16, 1, 4, 2.]], threshold: 6.8066660314798355e-003, right_val: 0.6677829027175903, left_val: 0.4756605029106140 }, { features: [[14, 13, 3, 6, -1.], [14, 15, 3, 2, 3.]], threshold: 3.6608621012419462e-003, right_val: 0.4311546981334686, left_val: 0.5369611978530884 }, { features: [[3, 13, 3, 6, -1.], [3, 15, 3, 2, 3.]], threshold: 0.0214496403932571, right_val: 0.1888816058635712, left_val: 0.4968641996383667 }, { features: [[6, 5, 10, 2, -1.], [11, 5, 5, 1, 2.], [6, 6, 5, 1, 2.]], threshold: 4.1678901761770248e-003, right_val: 0.5815368890762329, left_val: 0.4930733144283295 }, { features: [[2, 14, 14, 6, -1.], [2, 17, 14, 3, 2.]], threshold: 8.6467564105987549e-003, right_val: 0.4132595062255859, left_val: 0.5205205082893372 }, { features: [[10, 14, 1, 3, -1.], [10, 15, 1, 1, 3.]], threshold: -3.6114078829996288e-004, right_val: 0.4800927937030792, left_val: 0.5483555197715759 }, { features: [[4, 16, 2, 2, -1.], [4, 16, 1, 1, 2.], [5, 17, 1, 1, 2.]], threshold: 1.0808729566633701e-003, right_val: 0.6041421294212341, left_val: 0.4689902067184448 }, { features: [[10, 6, 2, 3, -1.], [10, 7, 2, 1, 3.]], threshold: 5.7719959877431393e-003, right_val: 0.3053277134895325, left_val: 0.5171142220497131 }, { features: [[0, 17, 20, 2, -1.], [0, 17, 10, 1, 2.], [10, 18, 10, 1, 2.]], threshold: 1.5720770461484790e-003, right_val: 0.4178803861141205, left_val: 0.5219978094100952 }, { features: [[13, 6, 1, 3, -1.], [13, 7, 1, 1, 3.]], threshold: -1.9307859474793077e-003, right_val: 0.4812920093536377, left_val: 0.5860369801521301 }, { features: [[8, 13, 3, 2, -1.], [9, 13, 1, 2, 3.]], threshold: -7.8926272690296173e-003, right_val: 0.4971733987331390, left_val: 0.1749276965856552 }, { features: [[12, 2, 3, 3, -1.], [13, 2, 1, 3, 3.]], threshold: -2.2224679123610258e-003, right_val: 0.5212848186492920, left_val: 0.4342589080333710 }, { features: [[3, 18, 2, 2, -1.], [3, 18, 1, 1, 2.], [4, 19, 1, 1, 2.]], threshold: 1.9011989934369922e-003, right_val: 0.6892055273056030, left_val: 0.4765186905860901 }, { features: [[9, 16, 3, 4, -1.], [10, 16, 1, 4, 3.]], threshold: 2.7576119173318148e-003, right_val: 0.4337486028671265, left_val: 0.5262191295623779 }, { features: [[6, 6, 1, 3, -1.], [6, 7, 1, 1, 3.]], threshold: 5.1787449046969414e-003, right_val: 0.7843729257583618, left_val: 0.4804069101810455 }, { features: [[13, 1, 5, 2, -1.], [13, 2, 5, 1, 2.]], threshold: -9.0273341629654169e-004, right_val: 0.5353423953056335, left_val: 0.4120846986770630 }, { features: [[7, 14, 6, 2, -1.], [7, 14, 3, 1, 2.], [10, 15, 3, 1, 2.]], threshold: 5.1797959022223949e-003, right_val: 0.6425960063934326, left_val: 0.4740372896194458 }, { features: [[11, 3, 3, 4, -1.], [12, 3, 1, 4, 3.]], threshold: -0.0101140001788735, right_val: 0.5175017714500427, left_val: 0.2468792051076889 }, { features: [[1, 13, 12, 6, -1.], [5, 13, 4, 6, 3.]], threshold: -0.0186170600354671, right_val: 0.4628978967666626, left_val: 0.5756294131278992 }, { features: [[14, 11, 5, 2, -1.], [14, 12, 5, 1, 2.]], threshold: 5.9225959703326225e-003, right_val: 0.3214271068572998, left_val: 0.5169625878334045 }, { features: [[2, 15, 14, 4, -1.], [2, 15, 7, 2, 2.], [9, 17, 7, 2, 2.]], threshold: -6.2945079989731312e-003, right_val: 0.5141636729240418, left_val: 0.3872014880180359 }, { features: [[3, 7, 14, 2, -1.], [10, 7, 7, 1, 2.], [3, 8, 7, 1, 2.]], threshold: 6.5353019163012505e-003, right_val: 0.6310489773750305, left_val: 0.4853048920631409 }, { features: [[1, 11, 4, 2, -1.], [1, 12, 4, 1, 2.]], threshold: 1.0878399480134249e-003, right_val: 0.3723258972167969, left_val: 0.5117315053939819 }, { features: [[14, 0, 6, 14, -1.], [16, 0, 2, 14, 3.]], threshold: -0.0225422400981188, right_val: 0.4887112975120544, left_val: 0.5692740082740784 }, { features: [[4, 11, 1, 3, -1.], [4, 12, 1, 1, 3.]], threshold: -3.0065660830587149e-003, right_val: 0.5003992915153503, left_val: 0.2556012868881226 }, { features: [[14, 0, 6, 14, -1.], [16, 0, 2, 14, 3.]], threshold: 7.4741272255778313e-003, right_val: 0.5675926804542542, left_val: 0.4810872972011566 }, { features: [[1, 10, 3, 7, -1.], [2, 10, 1, 7, 3.]], threshold: 0.0261623207479715, right_val: 0.1777237057685852, left_val: 0.4971194863319397 }, { features: [[8, 12, 9, 2, -1.], [8, 13, 9, 1, 2.]], threshold: 9.4352738233283162e-004, right_val: 0.5491250753402710, left_val: 0.4940010905265808 }, { features: [[0, 6, 20, 1, -1.], [10, 6, 10, 1, 2.]], threshold: 0.0333632417023182, right_val: 0.2790724039077759, left_val: 0.5007612109184265 }, { features: [[8, 4, 4, 4, -1.], [8, 4, 2, 4, 2.]], threshold: -0.0151186501607299, right_val: 0.4973031878471375, left_val: 0.7059578895568848 }, { features: [[0, 0, 2, 2, -1.], [0, 1, 2, 1, 2.]], threshold: 9.8648946732282639e-004, right_val: 0.3776761889457703, left_val: 0.5128620266914368 }], threshold: 104.7491989135742200 }, { simpleClassifiers: [{ features: [[5, 3, 10, 9, -1.], [5, 6, 10, 3, 3.]], threshold: -0.0951507985591888, right_val: 0.4017286896705627, left_val: 0.6470757126808167 }, { features: [[15, 2, 4, 10, -1.], [15, 2, 2, 10, 2.]], threshold: 6.2702340073883533e-003, right_val: 0.5746449232101440, left_val: 0.3999822139739990 }, { features: [[8, 2, 2, 7, -1.], [9, 2, 1, 7, 2.]], threshold: 3.0018089455552399e-004, right_val: 0.5538809895515442, left_val: 0.3558770120143890 }, { features: [[7, 4, 12, 1, -1.], [11, 4, 4, 1, 3.]], threshold: 1.1757409665733576e-003, right_val: 0.5382617712020874, left_val: 0.4256534874439240 }, { features: [[3, 4, 9, 1, -1.], [6, 4, 3, 1, 3.]], threshold: 4.4235268433112651e-005, right_val: 0.5589926838874817, left_val: 0.3682908117771149 }, { features: [[15, 10, 1, 4, -1.], [15, 12, 1, 2, 2.]], threshold: -2.9936920327600092e-005, right_val: 0.4020367860794067, left_val: 0.5452470183372498 }, { features: [[4, 10, 6, 4, -1.], [7, 10, 3, 4, 2.]], threshold: 3.0073199886828661e-003, right_val: 0.3317843973636627, left_val: 0.5239058136940002 }, { features: [[15, 9, 1, 6, -1.], [15, 12, 1, 3, 2.]], threshold: -0.0105138896033168, right_val: 0.5307983756065369, left_val: 0.4320689141750336 }, { features: [[7, 17, 6, 3, -1.], [7, 18, 6, 1, 3.]], threshold: 8.3476826548576355e-003, right_val: 0.6453298926353455, left_val: 0.4504637122154236 }, { features: [[14, 3, 2, 16, -1.], [15, 3, 1, 8, 2.], [14, 11, 1, 8, 2.]], threshold: -3.1492270063608885e-003, right_val: 0.5370525121688843, left_val: 0.4313425123691559 }, { features: [[4, 9, 1, 6, -1.], [4, 12, 1, 3, 2.]], threshold: -1.4435649973165710e-005, right_val: 0.3817971944808960, left_val: 0.5326603055000305 }, { features: [[12, 1, 5, 2, -1.], [12, 2, 5, 1, 2.]], threshold: -4.2855090578086674e-004, right_val: 0.5382009744644165, left_val: 0.4305163919925690 }, { features: [[6, 18, 4, 2, -1.], [6, 18, 2, 1, 2.], [8, 19, 2, 1, 2.]], threshold: 1.5062429883982986e-004, right_val: 0.5544965267181397, left_val: 0.4235970973968506 }, { features: [[2, 4, 16, 10, -1.], [10, 4, 8, 5, 2.], [2, 9, 8, 5, 2.]], threshold: 0.0715598315000534, right_val: 0.2678802907466888, left_val: 0.5303059816360474 }, { features: [[6, 5, 1, 10, -1.], [6, 10, 1, 5, 2.]], threshold: 8.4095180500298738e-004, right_val: 0.5205433964729309, left_val: 0.3557108938694000 }, { features: [[4, 8, 15, 2, -1.], [9, 8, 5, 2, 3.]], threshold: 0.0629865005612373, right_val: 0.2861376106739044, left_val: 0.5225362777709961 }, { features: [[1, 8, 15, 2, -1.], [6, 8, 5, 2, 3.]], threshold: -3.3798629883676767e-003, right_val: 0.5201697945594788, left_val: 0.3624185919761658 }, { features: [[9, 5, 3, 6, -1.], [9, 7, 3, 2, 3.]], threshold: -1.1810739670181647e-004, right_val: 0.3959893882274628, left_val: 0.5474476814270020 }, { features: [[5, 7, 8, 2, -1.], [9, 7, 4, 2, 2.]], threshold: -5.4505601292476058e-004, right_val: 0.5215715765953064, left_val: 0.3740422129631043 }, { features: [[9, 11, 2, 3, -1.], [9, 12, 2, 1, 3.]], threshold: -1.8454910023137927e-003, right_val: 0.4584448933601379, left_val: 0.5893052220344544 }, { features: [[1, 0, 16, 3, -1.], [1, 1, 16, 1, 3.]], threshold: -4.3832371011376381e-004, right_val: 0.5385351181030273, left_val: 0.4084582030773163 }, { features: [[11, 2, 7, 2, -1.], [11, 3, 7, 1, 2.]], threshold: -2.4000830017030239e-003, right_val: 0.5293580293655396, left_val: 0.3777455091476440 }, { features: [[5, 1, 10, 18, -1.], [5, 7, 10, 6, 3.]], threshold: -0.0987957417964935, right_val: 0.5070089101791382, left_val: 0.2963612079620361 }, { features: [[17, 4, 3, 2, -1.], [18, 4, 1, 2, 3.]], threshold: 3.1798239797353745e-003, right_val: 0.6726443767547607, left_val: 0.4877632856369019 }, { features: [[8, 13, 1, 3, -1.], [8, 14, 1, 1, 3.]], threshold: 3.2406419632025063e-004, right_val: 0.5561109781265259, left_val: 0.4366911053657532 }, { features: [[3, 14, 14, 6, -1.], [3, 16, 14, 2, 3.]], threshold: -0.0325472503900528, right_val: 0.5308616161346436, left_val: 0.3128157854080200 }, { features: [[0, 2, 3, 4, -1.], [1, 2, 1, 4, 3.]], threshold: -7.7561130747199059e-003, right_val: 0.4639872014522553, left_val: 0.6560224890708923 }, { features: [[12, 1, 5, 2, -1.], [12, 2, 5, 1, 2.]], threshold: 0.0160272493958473, right_val: 0.3141897916793823, left_val: 0.5172680020332336 }, { features: [[3, 1, 5, 2, -1.], [3, 2, 5, 1, 2.]], threshold: 7.1002350523485802e-006, right_val: 0.5336294770240784, left_val: 0.4084446132183075 }, { features: [[10, 13, 2, 3, -1.], [10, 14, 2, 1, 3.]], threshold: 7.3422808200120926e-003, right_val: 0.6603465080261231, left_val: 0.4966922104358673 }, { features: [[8, 13, 2, 3, -1.], [8, 14, 2, 1, 3.]], threshold: -1.6970280557870865e-003, right_val: 0.4500182867050171, left_val: 0.5908237099647522 }, { features: [[14, 12, 2, 3, -1.], [14, 13, 2, 1, 3.]], threshold: 2.4118260480463505e-003, right_val: 0.3599720895290375, left_val: 0.5315160751342773 }, { features: [[7, 2, 2, 3, -1.], [7, 3, 2, 1, 3.]], threshold: -5.5300937965512276e-003, right_val: 0.4996814131736755, left_val: 0.2334040999412537 }, { features: [[5, 6, 10, 4, -1.], [10, 6, 5, 2, 2.], [5, 8, 5, 2, 2.]], threshold: -2.6478730142116547e-003, right_val: 0.4684734046459198, left_val: 0.5880935788154602 }, { features: [[9, 13, 1, 6, -1.], [9, 16, 1, 3, 2.]], threshold: 0.0112956296652555, right_val: 0.1884590983390808, left_val: 0.4983777105808258 }, { features: [[10, 12, 2, 2, -1.], [11, 12, 1, 1, 2.], [10, 13, 1, 1, 2.]], threshold: -6.6952878842130303e-004, right_val: 0.4799019992351532, left_val: 0.5872138142585754 }, { features: [[4, 12, 2, 3, -1.], [4, 13, 2, 1, 3.]], threshold: 1.4410680159926414e-003, right_val: 0.3501011133193970, left_val: 0.5131189227104187 }, { features: [[14, 4, 6, 6, -1.], [14, 6, 6, 2, 3.]], threshold: 2.4637870956212282e-003, right_val: 0.4117639064788818, left_val: 0.5339372158050537 }, { features: [[8, 17, 2, 3, -1.], [8, 18, 2, 1, 3.]], threshold: 3.3114518737420440e-004, right_val: 0.5398246049880981, left_val: 0.4313383102416992 }, { features: [[16, 4, 4, 6, -1.], [16, 6, 4, 2, 3.]], threshold: -0.0335572697222233, right_val: 0.5179154872894287, left_val: 0.2675336897373200 }, { features: [[0, 4, 4, 6, -1.], [0, 6, 4, 2, 3.]], threshold: 0.0185394193977118, right_val: 0.2317177057266235, left_val: 0.4973869919776917 }, { features: [[14, 6, 2, 3, -1.], [14, 6, 1, 3, 2.]], threshold: -2.9698139405809343e-004, right_val: 0.4643664062023163, left_val: 0.5529708266258240 }, { features: [[4, 9, 8, 1, -1.], [8, 9, 4, 1, 2.]], threshold: -4.5577259152196348e-004, right_val: 0.4469191133975983, left_val: 0.5629584193229675 }, { features: [[8, 12, 4, 3, -1.], [8, 13, 4, 1, 3.]], threshold: -0.0101589802652597, right_val: 0.4925918877124786, left_val: 0.6706212759017944 }, { features: [[5, 12, 10, 6, -1.], [5, 14, 10, 2, 3.]], threshold: -2.2413829356082715e-005, right_val: 0.3912901878356934, left_val: 0.5239421725273132 }, { features: [[11, 12, 1, 2, -1.], [11, 13, 1, 1, 2.]], threshold: 7.2034963523037732e-005, right_val: 0.5501788854598999, left_val: 0.4799438118934631 }, { features: [[8, 15, 4, 2, -1.], [8, 16, 4, 1, 2.]], threshold: -6.9267209619283676e-003, right_val: 0.4698084890842438, left_val: 0.6930009722709656 }, { features: [[6, 9, 8, 8, -1.], [10, 9, 4, 4, 2.], [6, 13, 4, 4, 2.]], threshold: -7.6997838914394379e-003, right_val: 0.5480883121490479, left_val: 0.4099623858928680 }, { features: [[7, 12, 4, 6, -1.], [7, 12, 2, 3, 2.], [9, 15, 2, 3, 2.]], threshold: -7.3130549862980843e-003, right_val: 0.5057886242866516, left_val: 0.3283475935459137 }, { features: [[10, 11, 3, 1, -1.], [11, 11, 1, 1, 3.]], threshold: 1.9650589674711227e-003, right_val: 0.6398249864578247, left_val: 0.4978047013282776 }, { features: [[9, 7, 2, 10, -1.], [9, 7, 1, 5, 2.], [10, 12, 1, 5, 2.]], threshold: 7.1647600270807743e-003, right_val: 0.6222137212753296, left_val: 0.4661160111427307 }, { features: [[8, 0, 6, 6, -1.], [10, 0, 2, 6, 3.]], threshold: -0.0240786392241716, right_val: 0.5222162008285523, left_val: 0.2334644943475723 }, { features: [[3, 11, 2, 6, -1.], [3, 13, 2, 2, 3.]], threshold: -0.0210279691964388, right_val: 0.4938226044178009, left_val: 0.1183653995394707 }, { features: [[16, 12, 1, 2, -1.], [16, 13, 1, 1, 2.]], threshold: 3.6017020465806127e-004, right_val: 0.4116711020469666, left_val: 0.5325019955635071 }, { features: [[1, 14, 6, 6, -1.], [1, 14, 3, 3, 2.], [4, 17, 3, 3, 2.]], threshold: -0.0172197297215462, right_val: 0.4664269089698792, left_val: 0.6278762221336365 }, { features: [[13, 1, 3, 6, -1.], [14, 1, 1, 6, 3.]], threshold: -7.8672142699360847e-003, right_val: 0.5249736905097961, left_val: 0.3403415083885193 }, { features: [[8, 8, 2, 2, -1.], [8, 9, 2, 1, 2.]], threshold: -4.4777389848604798e-004, right_val: 0.5086259245872498, left_val: 0.3610411882400513 }, { features: [[9, 9, 3, 3, -1.], [10, 9, 1, 3, 3.]], threshold: 5.5486010387539864e-003, right_val: 0.6203498244285584, left_val: 0.4884265959262848 }, { features: [[8, 7, 3, 3, -1.], [8, 8, 3, 1, 3.]], threshold: -6.9461148232221603e-003, right_val: 0.5011097192764282, left_val: 0.2625930011272430 }, { features: [[14, 0, 2, 3, -1.], [14, 0, 1, 3, 2.]], threshold: 1.3569870498031378e-004, right_val: 0.5628312230110169, left_val: 0.4340794980525971 }, { features: [[1, 0, 18, 9, -1.], [7, 0, 6, 9, 3.]], threshold: -0.0458802506327629, right_val: 0.4696274995803833, left_val: 0.6507998704910278 }, { features: [[11, 5, 4, 15, -1.], [11, 5, 2, 15, 2.]], threshold: -0.0215825606137514, right_val: 0.5287616848945618, left_val: 0.3826502859592438 }, { features: [[5, 5, 4, 15, -1.], [7, 5, 2, 15, 2.]], threshold: -0.0202095396816731, right_val: 0.5074477195739746, left_val: 0.3233368098735809 }, { features: [[14, 0, 2, 3, -1.], [14, 0, 1, 3, 2.]], threshold: 5.8496710844337940e-003, right_val: 0.4489670991897583, left_val: 0.5177603960037231 }, { features: [[4, 0, 2, 3, -1.], [5, 0, 1, 3, 2.]], threshold: -5.7476379879517481e-005, right_val: 0.5246363878250122, left_val: 0.4020850956439972 }, { features: [[11, 12, 2, 2, -1.], [12, 12, 1, 1, 2.], [11, 13, 1, 1, 2.]], threshold: -1.1513100471347570e-003, right_val: 0.4905154109001160, left_val: 0.6315072178840637 }, { features: [[7, 12, 2, 2, -1.], [7, 12, 1, 1, 2.], [8, 13, 1, 1, 2.]], threshold: 1.9862831104546785e-003, right_val: 0.6497151255607605, left_val: 0.4702459871768951 }, { features: [[12, 0, 3, 4, -1.], [13, 0, 1, 4, 3.]], threshold: -5.2719512023031712e-003, right_val: 0.5227652788162231, left_val: 0.3650383949279785 }, { features: [[4, 11, 3, 3, -1.], [4, 12, 3, 1, 3.]], threshold: 1.2662699446082115e-003, right_val: 0.3877618014812470, left_val: 0.5166100859642029 }, { features: [[12, 7, 4, 2, -1.], [12, 8, 4, 1, 2.]], threshold: -6.2919440679252148e-003, right_val: 0.5023847818374634, left_val: 0.7375894188880920 }, { features: [[8, 10, 3, 2, -1.], [9, 10, 1, 2, 3.]], threshold: 6.7360111279413104e-004, right_val: 0.5495585799217224, left_val: 0.4423226118087769 }, { features: [[9, 9, 3, 2, -1.], [10, 9, 1, 2, 3.]], threshold: -1.0523450328037143e-003, right_val: 0.4859583079814911, left_val: 0.5976396203041077 }, { features: [[8, 9, 3, 2, -1.], [9, 9, 1, 2, 3.]], threshold: -4.4216238893568516e-004, right_val: 0.4398930966854096, left_val: 0.5955939292907715 }, { features: [[12, 0, 3, 4, -1.], [13, 0, 1, 4, 3.]], threshold: 1.1747940443456173e-003, right_val: 0.4605058133602142, left_val: 0.5349888205528259 }, { features: [[5, 0, 3, 4, -1.], [6, 0, 1, 4, 3.]], threshold: 5.2457437850534916e-003, right_val: 0.2941577136516571, left_val: 0.5049191117286682 }, { features: [[4, 14, 12, 4, -1.], [10, 14, 6, 2, 2.], [4, 16, 6, 2, 2.]], threshold: -0.0245397202670574, right_val: 0.5218586921691895, left_val: 0.2550177872180939 }, { features: [[8, 13, 2, 3, -1.], [8, 14, 2, 1, 3.]], threshold: 7.3793041519820690e-004, right_val: 0.5490816235542297, left_val: 0.4424861073493958 }, { features: [[10, 10, 3, 8, -1.], [10, 14, 3, 4, 2.]], threshold: 1.4233799884095788e-003, right_val: 0.4081355929374695, left_val: 0.5319514274597168 }, { features: [[8, 10, 4, 8, -1.], [8, 10, 2, 4, 2.], [10, 14, 2, 4, 2.]], threshold: -2.4149110540747643e-003, right_val: 0.5238950252532959, left_val: 0.4087659120559692 }, { features: [[10, 8, 3, 1, -1.], [11, 8, 1, 1, 3.]], threshold: -1.2165299849584699e-003, right_val: 0.4908052980899811, left_val: 0.5674579143524170 }, { features: [[9, 12, 1, 6, -1.], [9, 15, 1, 3, 2.]], threshold: -1.2438809499144554e-003, right_val: 0.5256118178367615, left_val: 0.4129425883293152 }, { features: [[10, 8, 3, 1, -1.], [11, 8, 1, 1, 3.]], threshold: 6.1942739412188530e-003, right_val: 0.7313653230667114, left_val: 0.5060194134712219 }, { features: [[7, 8, 3, 1, -1.], [8, 8, 1, 1, 3.]], threshold: -1.6607169527560472e-003, right_val: 0.4596369862556458, left_val: 0.5979632139205933 }, { features: [[5, 2, 15, 14, -1.], [5, 9, 15, 7, 2.]], threshold: -0.0273162592202425, right_val: 0.5308842062950134, left_val: 0.4174365103244782 }, { features: [[2, 1, 2, 10, -1.], [2, 1, 1, 5, 2.], [3, 6, 1, 5, 2.]], threshold: -1.5845570014789701e-003, right_val: 0.4519486129283905, left_val: 0.5615804791450501 }, { features: [[14, 14, 2, 3, -1.], [14, 15, 2, 1, 3.]], threshold: -1.5514739789068699e-003, right_val: 0.5360785126686096, left_val: 0.4076187014579773 }, { features: [[2, 7, 3, 3, -1.], [3, 7, 1, 3, 3.]], threshold: 3.8446558755822480e-004, right_val: 0.5430442094802856, left_val: 0.4347293972969055 }, { features: [[17, 4, 3, 3, -1.], [17, 5, 3, 1, 3.]], threshold: -0.0146722598001361, right_val: 0.5146093964576721, left_val: 0.1659304946660996 }, { features: [[0, 4, 3, 3, -1.], [0, 5, 3, 1, 3.]], threshold: 8.1608882173895836e-003, right_val: 0.1884745955467224, left_val: 0.4961819052696228 }, { features: [[13, 5, 6, 2, -1.], [16, 5, 3, 1, 2.], [13, 6, 3, 1, 2.]], threshold: 1.1121659772470593e-003, right_val: 0.6093816161155701, left_val: 0.4868263900279999 }, { features: [[4, 19, 12, 1, -1.], [8, 19, 4, 1, 3.]], threshold: -7.2603770531713963e-003, right_val: 0.4690375924110413, left_val: 0.6284325122833252 }, { features: [[12, 12, 2, 4, -1.], [12, 14, 2, 2, 2.]], threshold: -2.4046430189628154e-004, right_val: 0.4046044051647186, left_val: 0.5575000047683716 }, { features: [[3, 15, 1, 3, -1.], [3, 16, 1, 1, 3.]], threshold: -2.3348190006799996e-004, right_val: 0.5252848267555237, left_val: 0.4115762114524841 }, { features: [[11, 16, 6, 4, -1.], [11, 16, 3, 4, 2.]], threshold: 5.5736480280756950e-003, right_val: 0.5690100789070129, left_val: 0.4730072915554047 }, { features: [[2, 10, 3, 10, -1.], [3, 10, 1, 10, 3.]], threshold: 0.0306237693876028, right_val: 0.1740095019340515, left_val: 0.4971886873245239 }, { features: [[12, 8, 2, 4, -1.], [12, 8, 1, 4, 2.]], threshold: 9.2074798885732889e-004, right_val: 0.4354872107505798, left_val: 0.5372117757797241 }, { features: [[6, 8, 2, 4, -1.], [7, 8, 1, 4, 2.]], threshold: -4.3550739064812660e-005, right_val: 0.4347316920757294, left_val: 0.5366883873939514 }, { features: [[10, 14, 2, 3, -1.], [10, 14, 1, 3, 2.]], threshold: -6.6452710889279842e-003, right_val: 0.5160533189773560, left_val: 0.3435518145561218 }, { features: [[5, 1, 10, 3, -1.], [10, 1, 5, 3, 2.]], threshold: 0.0432219989597797, right_val: 0.7293652892112732, left_val: 0.4766792058944702 }, { features: [[10, 7, 3, 2, -1.], [11, 7, 1, 2, 3.]], threshold: 2.2331769578158855e-003, right_val: 0.5633171200752258, left_val: 0.5029315948486328 }, { features: [[5, 6, 9, 2, -1.], [8, 6, 3, 2, 3.]], threshold: 3.1829739455133677e-003, right_val: 0.5192136764526367, left_val: 0.4016092121601105 }, { features: [[9, 8, 2, 2, -1.], [9, 9, 2, 1, 2.]], threshold: -1.8027749320026487e-004, right_val: 0.5417919754981995, left_val: 0.4088315963745117 }, { features: [[2, 11, 16, 6, -1.], [2, 11, 8, 3, 2.], [10, 14, 8, 3, 2.]], threshold: -5.2934689447283745e-003, right_val: 0.5243561863899231, left_val: 0.4075677096843720 }, { features: [[12, 7, 2, 2, -1.], [13, 7, 1, 1, 2.], [12, 8, 1, 1, 2.]], threshold: 1.2750959722325206e-003, right_val: 0.6387010812759399, left_val: 0.4913282990455627 }, { features: [[9, 5, 2, 3, -1.], [9, 6, 2, 1, 3.]], threshold: 4.3385322205722332e-003, right_val: 0.2947346866130829, left_val: 0.5031672120094299 }, { features: [[9, 7, 3, 2, -1.], [10, 7, 1, 2, 3.]], threshold: 8.5250744596123695e-003, right_val: 0.6308869123458862, left_val: 0.4949789047241211 }, { features: [[5, 1, 8, 12, -1.], [5, 7, 8, 6, 2.]], threshold: -9.4266352243721485e-004, right_val: 0.4285649955272675, left_val: 0.5328366756439209 }, { features: [[13, 5, 2, 2, -1.], [13, 6, 2, 1, 2.]], threshold: 1.3609660090878606e-003, right_val: 0.5941501259803772, left_val: 0.4991525113582611 }, { features: [[5, 5, 2, 2, -1.], [5, 6, 2, 1, 2.]], threshold: 4.4782509212382138e-004, right_val: 0.5854480862617493, left_val: 0.4573504030704498 }, { features: [[12, 4, 3, 3, -1.], [12, 5, 3, 1, 3.]], threshold: 1.3360050506889820e-003, right_val: 0.5849052071571350, left_val: 0.4604358971118927 }, { features: [[4, 14, 2, 3, -1.], [4, 15, 2, 1, 3.]], threshold: -6.0967548051849008e-004, right_val: 0.5229423046112061, left_val: 0.3969388902187347 }, { features: [[12, 4, 3, 3, -1.], [12, 5, 3, 1, 3.]], threshold: -2.3656780831515789e-003, right_val: 0.4898357093334198, left_val: 0.5808320045471191 }, { features: [[5, 4, 3, 3, -1.], [5, 5, 3, 1, 3.]], threshold: 1.0734340175986290e-003, right_val: 0.5470039248466492, left_val: 0.4351210892200470 }, { features: [[9, 14, 2, 6, -1.], [10, 14, 1, 3, 2.], [9, 17, 1, 3, 2.]], threshold: 2.1923359017819166e-003, right_val: 0.3842903971672058, left_val: 0.5355060100555420 }, { features: [[8, 14, 3, 2, -1.], [9, 14, 1, 2, 3.]], threshold: 5.4968618787825108e-003, right_val: 0.2827191948890686, left_val: 0.5018138885498047 }, { features: [[9, 5, 6, 6, -1.], [11, 5, 2, 6, 3.]], threshold: -0.0753688216209412, right_val: 0.5148826837539673, left_val: 0.1225076019763947 }, { features: [[5, 5, 6, 6, -1.], [7, 5, 2, 6, 3.]], threshold: 0.0251344703137875, right_val: 0.7025446295738220, left_val: 0.4731766879558563 }, { features: [[13, 13, 1, 2, -1.], [13, 14, 1, 1, 2.]], threshold: -2.9358599931583740e-005, right_val: 0.4656086862087250, left_val: 0.5430532097816467 }, { features: [[0, 2, 10, 2, -1.], [0, 3, 10, 1, 2.]], threshold: -5.8355910005047917e-004, right_val: 0.5190119743347168, left_val: 0.4031040072441101 }, { features: [[13, 13, 1, 2, -1.], [13, 14, 1, 1, 2.]], threshold: -2.6639450807124376e-003, right_val: 0.5161771178245544, left_val: 0.4308126866817474 }, { features: [[5, 7, 2, 2, -1.], [5, 7, 1, 1, 2.], [6, 8, 1, 1, 2.]], threshold: -1.3804089976474643e-003, right_val: 0.4695515930652618, left_val: 0.6219829916954041 }, { features: [[13, 5, 2, 7, -1.], [13, 5, 1, 7, 2.]], threshold: 1.2313219485804439e-003, right_val: 0.4425831139087677, left_val: 0.5379363894462585 }, { features: [[6, 13, 1, 2, -1.], [6, 14, 1, 1, 2.]], threshold: -1.4644179827882908e-005, right_val: 0.4222503006458283, left_val: 0.5281640291213989 }, { features: [[11, 0, 3, 7, -1.], [12, 0, 1, 7, 3.]], threshold: -0.0128188095986843, right_val: 0.5179932713508606, left_val: 0.2582092881202698 }, { features: [[0, 3, 2, 16, -1.], [0, 3, 1, 8, 2.], [1, 11, 1, 8, 2.]], threshold: 0.0228521898388863, right_val: 0.7609264254570007, left_val: 0.4778693020343781 }, { features: [[11, 0, 3, 7, -1.], [12, 0, 1, 7, 3.]], threshold: 8.2305970136076212e-004, right_val: 0.4671724140644074, left_val: 0.5340992212295532 }, { features: [[6, 0, 3, 7, -1.], [7, 0, 1, 7, 3.]], threshold: 0.0127701200544834, right_val: 0.1472366005182266, left_val: 0.4965761005878449 }, { features: [[11, 16, 8, 4, -1.], [11, 16, 4, 4, 2.]], threshold: -0.0500515103340149, right_val: 0.5016592144966126, left_val: 0.6414994001388550 }, { features: [[1, 16, 8, 4, -1.], [5, 16, 4, 4, 2.]], threshold: 0.0157752707600594, right_val: 0.5685362219810486, left_val: 0.4522320032119751 }, { features: [[13, 5, 2, 7, -1.], [13, 5, 1, 7, 2.]], threshold: -0.0185016207396984, right_val: 0.5137959122657776, left_val: 0.2764748930931091 }, { features: [[5, 5, 2, 7, -1.], [6, 5, 1, 7, 2.]], threshold: 2.4626250378787518e-003, right_val: 0.3795408010482788, left_val: 0.5141941905021668 }, { features: [[18, 6, 2, 14, -1.], [18, 13, 2, 7, 2.]], threshold: 0.0629161670804024, right_val: 0.6580433845520020, left_val: 0.5060648918151856 }, { features: [[6, 10, 3, 4, -1.], [6, 12, 3, 2, 2.]], threshold: -2.1648500478477217e-005, right_val: 0.4019886851310730, left_val: 0.5195388197898865 }, { features: [[14, 7, 1, 2, -1.], [14, 8, 1, 1, 2.]], threshold: 2.1180990152060986e-003, right_val: 0.5954458713531494, left_val: 0.4962365031242371 }, { features: [[0, 1, 18, 6, -1.], [0, 1, 9, 3, 2.], [9, 4, 9, 3, 2.]], threshold: -0.0166348908096552, right_val: 0.5175446867942810, left_val: 0.3757933080196381 }, { features: [[14, 7, 1, 2, -1.], [14, 8, 1, 1, 2.]], threshold: -2.8899470344185829e-003, right_val: 0.5057178735733032, left_val: 0.6624013781547546 }, { features: [[0, 6, 2, 14, -1.], [0, 13, 2, 7, 2.]], threshold: 0.0767832621932030, right_val: 0.8047714829444885, left_val: 0.4795796871185303 }, { features: [[17, 0, 3, 12, -1.], [18, 0, 1, 12, 3.]], threshold: 3.9170677773654461e-003, right_val: 0.5719941854476929, left_val: 0.4937882125377655 }, { features: [[0, 6, 18, 3, -1.], [0, 7, 18, 1, 3.]], threshold: -0.0726706013083458, right_val: 0.4943903982639313, left_val: 0.0538945607841015 }, { features: [[6, 0, 14, 16, -1.], [6, 8, 14, 8, 2.]], threshold: 0.5403950214385986, right_val: 0.1143338978290558, left_val: 0.5129774212837219 }, { features: [[0, 0, 3, 12, -1.], [1, 0, 1, 12, 3.]], threshold: 2.9510019812732935e-003, right_val: 0.5698574185371399, left_val: 0.4528343975543976 }, { features: [[13, 0, 3, 7, -1.], [14, 0, 1, 7, 3.]], threshold: 3.4508369863033295e-003, right_val: 0.4218730926513672, left_val: 0.5357726812362671 }, { features: [[5, 7, 1, 2, -1.], [5, 8, 1, 1, 2.]], threshold: -4.2077939724549651e-004, right_val: 0.4637925922870636, left_val: 0.5916172862052918 }, { features: [[14, 4, 6, 6, -1.], [14, 6, 6, 2, 3.]], threshold: 3.3051050268113613e-003, right_val: 0.4382042884826660, left_val: 0.5273385047912598 }, { features: [[5, 7, 7, 2, -1.], [5, 8, 7, 1, 2.]], threshold: 4.7735060798004270e-004, right_val: 0.5181884765625000, left_val: 0.4046528041362763 }, { features: [[8, 6, 6, 9, -1.], [8, 9, 6, 3, 3.]], threshold: -0.0259285103529692, right_val: 0.5089386105537415, left_val: 0.7452235817909241 }, { features: [[5, 4, 6, 1, -1.], [7, 4, 2, 1, 3.]], threshold: -2.9729790985584259e-003, right_val: 0.5058795213699341, left_val: 0.3295435905456543 }, { features: [[13, 0, 6, 4, -1.], [16, 0, 3, 2, 2.], [13, 2, 3, 2, 2.]], threshold: 5.8508329093456268e-003, right_val: 0.5793024897575378, left_val: 0.4857144057750702 }, { features: [[1, 2, 18, 12, -1.], [1, 6, 18, 4, 3.]], threshold: -0.0459675192832947, right_val: 0.5380653142929077, left_val: 0.4312731027603149 }, { features: [[3, 2, 17, 12, -1.], [3, 6, 17, 4, 3.]], threshold: 0.1558596044778824, right_val: 0.1684713959693909, left_val: 0.5196170210838318 }, { features: [[5, 14, 7, 3, -1.], [5, 15, 7, 1, 3.]], threshold: 0.0151648297905922, right_val: 0.6735026836395264, left_val: 0.4735757112503052 }, { features: [[10, 14, 1, 3, -1.], [10, 15, 1, 1, 3.]], threshold: -1.0604249546304345e-003, right_val: 0.4775702953338623, left_val: 0.5822926759719849 }, { features: [[3, 14, 3, 3, -1.], [3, 15, 3, 1, 3.]], threshold: 6.6476291976869106e-003, right_val: 0.2319535017013550, left_val: 0.4999198913574219 }, { features: [[14, 4, 6, 6, -1.], [14, 6, 6, 2, 3.]], threshold: -0.0122311301529408, right_val: 0.5262982249259949, left_val: 0.4750893115997315 }, { features: [[0, 4, 6, 6, -1.], [0, 6, 6, 2, 3.]], threshold: 5.6528882123529911e-003, right_val: 0.3561818897724152, left_val: 0.5069767832756043 }, { features: [[12, 5, 4, 3, -1.], [12, 6, 4, 1, 3.]], threshold: 1.2977829901501536e-003, right_val: 0.5619062781333923, left_val: 0.4875693917274475 }, { features: [[4, 5, 4, 3, -1.], [4, 6, 4, 1, 3.]], threshold: 0.0107815898954868, right_val: 0.6782308220863342, left_val: 0.4750770032405853 }, { features: [[18, 0, 2, 6, -1.], [18, 2, 2, 2, 3.]], threshold: 2.8654779307544231e-003, right_val: 0.4290736019611359, left_val: 0.5305461883544922 }, { features: [[8, 1, 4, 9, -1.], [10, 1, 2, 9, 2.]], threshold: 2.8663428965955973e-003, right_val: 0.5539351105690002, left_val: 0.4518479108810425 }, { features: [[6, 6, 8, 2, -1.], [6, 6, 4, 2, 2.]], threshold: -5.1983320154249668e-003, right_val: 0.5434188842773438, left_val: 0.4149119853973389 }, { features: [[6, 5, 4, 2, -1.], [6, 5, 2, 1, 2.], [8, 6, 2, 1, 2.]], threshold: 5.3739990107715130e-003, right_val: 0.6507657170295715, left_val: 0.4717896878719330 }, { features: [[10, 5, 2, 3, -1.], [10, 6, 2, 1, 3.]], threshold: -0.0146415298804641, right_val: 0.5161777138710022, left_val: 0.2172164022922516 }, { features: [[9, 5, 1, 3, -1.], [9, 6, 1, 1, 3.]], threshold: -1.5042580344015732e-005, right_val: 0.4298836886882782, left_val: 0.5337383747100830 }, { features: [[9, 10, 2, 2, -1.], [9, 11, 2, 1, 2.]], threshold: -1.1875660129589960e-004, right_val: 0.5582447052001953, left_val: 0.4604594111442566 }, { features: [[0, 8, 4, 3, -1.], [0, 9, 4, 1, 3.]], threshold: 0.0169955305755138, right_val: 0.0738800764083862, left_val: 0.4945895075798035 }, { features: [[6, 0, 8, 6, -1.], [6, 3, 8, 3, 2.]], threshold: -0.0350959412753582, right_val: 0.4977591037750244, left_val: 0.7005509138107300 }, { features: [[1, 0, 6, 4, -1.], [1, 0, 3, 2, 2.], [4, 2, 3, 2, 2.]], threshold: 2.4217350874096155e-003, right_val: 0.5477694272994995, left_val: 0.4466265141963959 }, { features: [[13, 0, 3, 7, -1.], [14, 0, 1, 7, 3.]], threshold: -9.6340337768197060e-004, right_val: 0.5313338041305542, left_val: 0.4714098870754242 }, { features: [[9, 16, 2, 2, -1.], [9, 17, 2, 1, 2.]], threshold: 1.6391130338888615e-004, right_val: 0.5342242121696472, left_val: 0.4331546127796173 }, { features: [[11, 4, 6, 10, -1.], [11, 9, 6, 5, 2.]], threshold: -0.0211414601653814, right_val: 0.5204498767852783, left_val: 0.2644700109958649 }, { features: [[0, 10, 19, 2, -1.], [0, 11, 19, 1, 2.]], threshold: 8.7775202700868249e-004, right_val: 0.4152742922306061, left_val: 0.5208349823951721 }, { features: [[9, 5, 8, 9, -1.], [9, 8, 8, 3, 3.]], threshold: -0.0279439203441143, right_val: 0.5018811821937561, left_val: 0.6344125270843506 }, { features: [[4, 0, 3, 7, -1.], [5, 0, 1, 7, 3.]], threshold: 6.7297378554940224e-003, right_val: 0.3500863909721375, left_val: 0.5050438046455383 }, { features: [[8, 6, 4, 12, -1.], [10, 6, 2, 6, 2.], [8, 12, 2, 6, 2.]], threshold: 0.0232810396701097, right_val: 0.6968677043914795, left_val: 0.4966318011283875 }, { features: [[0, 2, 6, 4, -1.], [0, 4, 6, 2, 2.]], threshold: -0.0116449799388647, right_val: 0.5049629807472229, left_val: 0.3300260007381439 }, { features: [[8, 15, 4, 3, -1.], [8, 16, 4, 1, 3.]], threshold: 0.0157643090933561, right_val: 0.7321153879165649, left_val: 0.4991598129272461 }, { features: [[8, 0, 3, 7, -1.], [9, 0, 1, 7, 3.]], threshold: -1.3611479662358761e-003, right_val: 0.5160670876502991, left_val: 0.3911735117435455 }, { features: [[9, 5, 3, 4, -1.], [10, 5, 1, 4, 3.]], threshold: -8.1522337859496474e-004, right_val: 0.4949719011783600, left_val: 0.5628911256790161 }, { features: [[8, 5, 3, 4, -1.], [9, 5, 1, 4, 3.]], threshold: -6.0066272271797061e-004, right_val: 0.4550595879554749, left_val: 0.5853595137596130 }, { features: [[7, 6, 6, 1, -1.], [9, 6, 2, 1, 3.]], threshold: 4.9715518252924085e-004, right_val: 0.5443599224090576, left_val: 0.4271470010280609 }, { features: [[7, 14, 4, 4, -1.], [7, 14, 2, 2, 2.], [9, 16, 2, 2, 2.]], threshold: 2.3475370835512877e-003, right_val: 0.3887656927108765, left_val: 0.5143110752105713 }, { features: [[13, 14, 4, 6, -1.], [15, 14, 2, 3, 2.], [13, 17, 2, 3, 2.]], threshold: -8.9261569082736969e-003, right_val: 0.4971720874309540, left_val: 0.6044502258300781 }, { features: [[7, 8, 1, 8, -1.], [7, 12, 1, 4, 2.]], threshold: -0.0139199104160070, right_val: 0.5000367760658264, left_val: 0.2583160996437073 }, { features: [[16, 0, 2, 8, -1.], [17, 0, 1, 4, 2.], [16, 4, 1, 4, 2.]], threshold: 1.0209949687123299e-003, right_val: 0.5560358166694641, left_val: 0.4857374131679535 }, { features: [[2, 0, 2, 8, -1.], [2, 0, 1, 4, 2.], [3, 4, 1, 4, 2.]], threshold: -2.7441629208624363e-003, right_val: 0.4645777046680450, left_val: 0.5936884880065918 }, { features: [[6, 1, 14, 3, -1.], [6, 2, 14, 1, 3.]], threshold: -0.0162001308053732, right_val: 0.5193495154380798, left_val: 0.3163014948368073 }, { features: [[7, 9, 3, 10, -1.], [7, 14, 3, 5, 2.]], threshold: 4.3331980705261230e-003, right_val: 0.3458878993988037, left_val: 0.5061224102973938 }, { features: [[9, 14, 2, 2, -1.], [9, 15, 2, 1, 2.]], threshold: 5.8497930876910686e-004, right_val: 0.5870177745819092, left_val: 0.4779017865657806 }, { features: [[7, 7, 6, 8, -1.], [7, 11, 6, 4, 2.]], threshold: -2.2466450463980436e-003, right_val: 0.5374773144721985, left_val: 0.4297851026058197 }, { features: [[9, 7, 3, 6, -1.], [9, 10, 3, 3, 2.]], threshold: 2.3146099410951138e-003, right_val: 0.4640969932079315, left_val: 0.5438671708106995 }, { features: [[7, 13, 3, 3, -1.], [7, 14, 3, 1, 3.]], threshold: 8.7679121643304825e-003, right_val: 0.6771789789199829, left_val: 0.4726893007755280 }, { features: [[9, 9, 2, 2, -1.], [9, 10, 2, 1, 2.]], threshold: -2.2448020172305405e-004, right_val: 0.5428048968315125, left_val: 0.4229173064231873 }, { features: [[0, 1, 18, 2, -1.], [6, 1, 6, 2, 3.]], threshold: -7.4336021207273006e-003, right_val: 0.4683673977851868, left_val: 0.6098880767822266 }, { features: [[7, 1, 6, 14, -1.], [7, 8, 6, 7, 2.]], threshold: -2.3189240600913763e-003, right_val: 0.4424242079257965, left_val: 0.5689436793327332 }, { features: [[1, 9, 18, 1, -1.], [7, 9, 6, 1, 3.]], threshold: -2.1042178850620985e-003, right_val: 0.5187087059020996, left_val: 0.3762221038341522 }, { features: [[9, 7, 2, 2, -1.], [9, 7, 1, 2, 2.]], threshold: 4.6034841216169298e-004, right_val: 0.5771207213401794, left_val: 0.4699405133724213 }, { features: [[9, 3, 2, 9, -1.], [10, 3, 1, 9, 2.]], threshold: 1.0547629790380597e-003, right_val: 0.5601701736450195, left_val: 0.4465216994285584 }, { features: [[18, 14, 2, 3, -1.], [18, 15, 2, 1, 3.]], threshold: 8.7148818420246243e-004, right_val: 0.3914709091186523, left_val: 0.5449805259704590 }, { features: [[7, 11, 3, 1, -1.], [8, 11, 1, 1, 3.]], threshold: 3.3364820410497487e-004, right_val: 0.5645738840103149, left_val: 0.4564009010791779 }, { features: [[10, 8, 3, 4, -1.], [11, 8, 1, 4, 3.]], threshold: -1.4853250468149781e-003, right_val: 0.4692778885364533, left_val: 0.5747377872467041 }, { features: [[7, 14, 3, 6, -1.], [8, 14, 1, 6, 3.]], threshold: 3.0251620337367058e-003, right_val: 0.3762814104557037, left_val: 0.5166196823120117 }, { features: [[10, 8, 3, 4, -1.], [11, 8, 1, 4, 3.]], threshold: 5.0280741415917873e-003, right_val: 0.6151527166366577, left_val: 0.5002111792564392 }, { features: [[7, 8, 3, 4, -1.], [8, 8, 1, 4, 3.]], threshold: -5.8164511574432254e-004, right_val: 0.4390751123428345, left_val: 0.5394598245620728 }, { features: [[7, 9, 6, 9, -1.], [7, 12, 6, 3, 3.]], threshold: 0.0451415292918682, right_val: 0.2063035964965820, left_val: 0.5188326835632324 }, { features: [[0, 14, 2, 3, -1.], [0, 15, 2, 1, 3.]], threshold: -1.0795620037242770e-003, right_val: 0.5137907266616821, left_val: 0.3904685080051422 }, { features: [[11, 12, 1, 2, -1.], [11, 13, 1, 1, 2.]], threshold: 1.5995999274309725e-004, right_val: 0.5427504181861877, left_val: 0.4895322918891907 }, { features: [[4, 3, 8, 3, -1.], [8, 3, 4, 3, 2.]], threshold: -0.0193592701107264, right_val: 0.4773507118225098, left_val: 0.6975228786468506 }, { features: [[0, 4, 20, 6, -1.], [0, 4, 10, 6, 2.]], threshold: 0.2072550952434540, right_val: 0.3034991919994354, left_val: 0.5233635902404785 }, { features: [[9, 14, 1, 3, -1.], [9, 15, 1, 1, 3.]], threshold: -4.1953290929086506e-004, right_val: 0.4460186064243317, left_val: 0.5419396758079529 }, { features: [[8, 14, 4, 3, -1.], [8, 15, 4, 1, 3.]], threshold: 2.2582069505006075e-003, right_val: 0.6027408838272095, left_val: 0.4815764129161835 }, { features: [[0, 15, 14, 4, -1.], [0, 17, 14, 2, 2.]], threshold: -6.7811207845807076e-003, right_val: 0.5183305740356445, left_val: 0.3980278968811035 }, { features: [[1, 14, 18, 6, -1.], [1, 17, 18, 3, 2.]], threshold: 0.0111543098464608, right_val: 0.4188759922981262, left_val: 0.5431231856346130 }, { features: [[0, 0, 10, 6, -1.], [0, 0, 5, 3, 2.], [5, 3, 5, 3, 2.]], threshold: 0.0431624315679073, right_val: 0.6522961258888245, left_val: 0.4738228023052216 }], threshold: 105.7611007690429700 }], size: [20, 20], tilted: false };
})(jsfeat.haar);
var SafaFace = (function () {

    var SafaFace = function () {
        var options, ctx, canvasWidth, canvasHeight;
        var img_u8, work_canvas, work_ctx, ii_sum, ii_sqsum, ii_tilted, edg, ii_canny;
        var classifier = jsfeat.haar.frontalface;
        var max_work_size = 160;
        var fsc;
        var islocked = false;
        var Silvercontrol;
        var ischeck = true;
        var m;
        var defaultOptions = function () {
            this.min_scale = 3;
            this.scale_factor = 1.5;//1.15;
            this.use_canny = true;//true;
            this.edges_density = 0.13;
            this.equalize_histogram = true;
        }

        this.options = {
            OnFaceDetected: function () { }
        };

        this.reset = function () {

            ctx.fillStyle = "rgba(2000,255,200,1)";
            ctx.strokeStyle = "rgb(0,255,0)";
            ctx.lineWidth = 1;
            setTimeout(function () { ischeck = true }, 2000);
        }

        this.load2 = function () {

            Silvercontrol = document.getElementById("silverlightControl");
            Silvercontrol.children[0].Content.Page.StartCapture();

            //if (slCtl != undefined)
            //  slCtl.Content.Page.StartCapture();
        }
        this.load = function (poptions) {

            this.options = poptions;

            m = this.options;
            Silvercontrol = document.getElementById("silverlightControl");
            videoWidth = 640;
            videoHeight = 480;
            fsc = document.createElement('img');
            $('#id').append('<canvas id="canvas" width="640" height="480" class="faceimg"/>');
            var canvas = document.getElementById('canvas');
            ctx = canvas.getContext('2d');
            ctx.fillStyle = "rgba(2000,255,200,1)";
            ctx.strokeStyle = "rgb(0,255,200)";
            ctx.lineWidth = 1;
            ctx.font = "200px tahoma";

            canvasWidth = videoWidth;
            canvasHeight = videoHeight;
            var scale = Math.min(max_work_size / videoWidth, max_work_size / videoHeight);
            var w = (videoWidth * scale) | 0;
            var h = (videoHeight * scale) | 0;

            img_u8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
            edg = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
            work_canvas = document.createElement('canvas');
            work_canvas.width = w;
            work_canvas.height = h;

            work_ctx = work_canvas.getContext('2d');
            ii_sum = new Int32Array((w + 1) * (h + 1));
            ii_sqsum = new Int32Array((w + 1) * (h + 1));
            ii_tilted = new Int32Array((w + 1) * (h + 1));
            ii_canny = new Int32Array((w + 1) * (h + 1));

            options = new defaultOptions();
        }

        function intersectRect(r1, r2) {
            return !(r2.left < r1.left || r2.bottom > r1.bottom || r2.right > r1.right || r2.bottom > r1.bottom);
        }


        this.faceDetection = function (pImage, pCallbackDetected) {


            if (!islocked)
                detect(pImage, pCallbackDetected);

        }

        function detect(pImage, pCallbackDetected) {

            try {

                var imageBase64Data = 'data:image/jpg;base64,' + pImage;//work_ctx.getImageData(0, 0, work_canvas.width, work_canvas.height);
                fsc.setAttribute('src', imageBase64Data);

                try {
                    work_ctx.drawImage(fsc, 0, 0, work_canvas.width, work_canvas.height);
                    // var imageData = work_ctx.getImageData(0, 0, work_canvas.width, work_canvas.height);

                    var imageData = work_ctx.getImageData(0, 0, work_canvas.width, work_canvas.height);

                    //// init the array by size
                    //var data_u32 = new Uint32Array(work_canvas.width * work_canvas.height * 4);

                    //// fill the array "manually"
                    //var data = imageData.data;
                    //for (var i = 0; i < data.length; i++) {
                    //    data_u32[i] = data[i];
                    //}

                    ////var data = data_u32;//imageData.data;

                    jsfeat.imgproc.grayscale(imageData.data, work_canvas.width, work_canvas.height, img_u8);

                    if (options.equalize_histogram) {
                        jsfeat.imgproc.equalize_histogram(img_u8, img_u8);
                    }

                    jsfeat.imgproc.compute_integral_image(img_u8, ii_sum, ii_sqsum, classifier.tilted ? ii_tilted : null);


                    if (options.use_canny) {
                        //try {
                        //    jsfeat.imgproc.canny(img_u8, edg, 10, 50);
                        //} catch (e) { console.log(e); }

                        try {
                            jsfeat.imgproc.canny(img_u8, edg, 10, 50);
                            jsfeat.imgproc.compute_integral_image(edg, ii_canny, null, null);
                        } catch (e) { console.log(e); }
                    }


                    jsfeat.haar.edges_density = options.edges_density;
                    var rects = jsfeat.haar.detect_multi_scale(ii_sum, ii_sqsum, ii_tilted, options.use_canny ? ii_canny : null, img_u8.cols, img_u8.rows, classifier, options.scale_factor, options.min_scale);
                    rects = jsfeat.haar.group_rectangles(rects, 1);

                    //console.log(rects.length);

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(fsc, 0, 0);

                    draw_faces(ctx, rects, canvasWidth / img_u8.cols, 1, pCallbackDetected);

                    //if (pCallbackCapture != undefined) {
                    //    var tmpimage = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    //    var canvasoverlay1 = document.createElement("canvas");//document.getElementById("canvasResult");
                    //    canvasoverlay1.width = tmpimage.width;
                    //    canvasoverlay1.height = tmpimage.height;
                    //    var ctxover = canvasoverlay1.getContext("2d");
                    //    ctxover.putImageData(tmpimage, 0, 0);
                    //    var pim = canvasoverlay1.toDataURL("image/jpeg");
                    //    pim = pim.replace(/^data:image\/(png|jpeg);base64,/, '');
                    //    Silvercontrol.Content.SafaFaceSilver.RaiseCaptureCamera(pim);

                    //    //if (pCallbackCapture != undefined)
                    //    //    pCallbackCapture(pim);
                    //}
                } catch (e) {
                    var ff = e;
                }

            } catch (e) {
                var gg = e;
            }
        }


        var tmptimer = 0;

        function startTimer(duration, display, callback) {
            var start = Date.now(),
                diff,
                minutes,
                seconds;
            function timer() {
                diff = duration - (((Date.now() - start) / 1000) | 0);

                minutes = (diff / 60) | 0;
                seconds = (diff % 60) | 0;

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                //display.textContent = minutes + ":" + seconds;
                ctx.lineWidth += 1;// / (seconds * 2);
                //ctx.strokeStyle = "rgb(0,255," + ctx.lineWidth * 90 + ")";

                if (diff <= 0) {

                    start = Date.now() + 1000;
                    StopTimer();
                    callback();
                    $('#id').addClass('flash');
                    $('#canvas').css('opacity', 0.2);
                    setTimeout(function () {
                        $('#id').removeClass('flash');
                        $('#canvas').css('opacity', 1);
                    }, 200);
                    //ctx.fillRect(0, 0, 800, 800);
                }
            };
            timer();
            tmptimer = setInterval(timer, 1000);
        }

        function StopTimer() {
            clearInterval(tmptimer);
            //$('#time').text(DefaultTime);
            tmptimer = 0;
            //tmpload = false;
        }

        function ResetTime(callback) {

            if (tmptimer == 0) {
                ctx.strokeStyle = "rgb(0,255,0)";
                ctx.lineWidth = 1;
                //tmpLoad = true;

                var fiveMinutes = 60 * 0.03;
                //display = document.querySelector('#time');
                var display = null;
                startTimer(fiveMinutes, display, callback);
            }
        }


        //var countdown = 2;
        var tmpLastx, tmpLasty, tmpLastww, tmpLasthh, tmpLastFrame;
        function draw_faces(ctx, rects, sc, max, pCallbackDetected) {

            var on = rects.length;
            if (on && max) {
                jsfeat.math.qsort(rects, 0, on - 1, function (a, b) { return (b.confidence < a.confidence); })
            }
            var n = max || on;
            n = Math.min(n, on);
            var r;

            var rectfirst = rects[0];
            var tmpmargin = 12;
            var goodPositionFace = { left: 35 - tmpmargin, top: 23 - tmpmargin, right: 112 + tmpmargin, bottom: 97 + tmpmargin };
            var firstFace = { left: rectfirst.x, top: rectfirst.y, right: rectfirst.x + rectfirst.width, bottom: rectfirst.y + rectfirst.height };

            var isgood = false;
            if (intersectRect(goodPositionFace, firstFace)) {

                isgood = true;
            } else {
                ctx.lineWidth = 1;
                tmpLastFrame = null;
                ctx.strokeStyle = "rgb(255,0,0)";
                isgood = false;
                StopTimer();
            }

            //for (var i = 0; i < n; ++i) {
            r = rects[0];
            var x = (r.x * sc) | 0;
            var y = (r.y * sc) | 0;
            var ww = (r.width * sc) | 0;
            var hh = (r.height * sc) | 0;

            if (isgood) {

                if (ischeck) {
                    if (tmptimer != 0) {
                        tmpLastx = x;
                        tmpLasty = y;
                        tmpLastww = ww;
                        tmpLasthh = hh;
                        tmpLastFrame = ctx.getImageData(tmpLastx - 25, tmpLasty - 25, tmpLastww + 50, tmpLasthh + 50);
                    }

                    ResetTime(function () {

                        //$('#id').addClass('flash');
                        //setTimeout(function () {
                        //    $('#id').removeClass('flash');
                        //}, 500);

                        var tmpimage = tmpLastFrame;//ctx.getImageData(tmpLastx - 25, tmpLasty - 25, tmpLastww + 50, tmpLasthh + 50);
                        var canvasoverlay1 = document.createElement("canvas");//document.getElementById("canvasResult";
                        canvasoverlay1.width = tmpimage.width;
                        canvasoverlay1.height = tmpimage.height;
                        var ctxover = canvasoverlay1.getContext("2d");
                        ctxover.putImageData(tmpimage, 0, 0);
                        var pFace1 = canvasoverlay1.toDataURL("image/jpeg");
                        var pFace = pFace1.replace(/^data:image\/(png|jpeg);base64,/, '');

                        if (Silvercontrol.Content != undefined)
                            Silvercontrol.Content.SafaFaceSilver.RaiseDetectedFace(pFace);

                        if (pCallbackDetected != undefined)
                            pCallbackDetected(pFace);

                        m.OnFaceDetected(pFace1);

                        ischeck = false;

                        //tmpload = false;
                        //StopTimer();
                        //ctx.lineWidth = 1.5;
                        //tmpLastFrame = null;
                    });
                }
            }

            ctx.strokeRect(x, y, ww, hh);

            //ctx.fillRect(x + 10, y + 10, ww - 20, hh - 20);
            //var tmpheight = r.height;
            //var tmpwidth = r.width;

            //var tmpscale = 150;

            //var tmpx = r.x + 0;
            //var tmpy = r.y + 0;

            //var tmprecx = ((tmpx * sc) | 0);
            //var tmprecy = ((tmpy * sc) | 0);

            //var tmprecwidth = ((tmpwidth * sc) | 0);
            //var tmprecheight = ((tmpheight * sc) | 0);

            //tmprecx -= (tmprecx - (tmprecx / tmpscale * (1 == 0 ? 1 : 1.2) * 100)) - 25;
            //tmprecy -= (tmprecy - (tmprecy / tmpscale * (1 == 0 ? 1 : 1.2) * 50)) - 25;

            //tmprecwidth += (tmprecwidth - (tmprecwidth / tmpscale * 100)) - 50;
            //tmprecheight += (tmprecheight - (tmprecheight / tmpscale * 100)) - 20;
            //ctx.roundRect(tmprecx, tmprecy, tmprecwidth, tmprecheight, 200).stroke();

            // }
        }

        //CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        //    if (w < 2 * r) r = w / 2;
        //    if (h < 2 * r) r = h / 2;
        //    this.beginPath();
        //    this.moveTo(x + r, y);
        //    this.arcTo(x + w, y, x + w, y + h, r);
        //    this.arcTo(x + w, y + h, x, y + h, r);
        //    this.arcTo(x, y + h, x, y, r);
        //    this.arcTo(x, y, x + w, y, r);
        //    this.closePath();
        //    return this;
        //}
    };
    return SafaFace;

})();