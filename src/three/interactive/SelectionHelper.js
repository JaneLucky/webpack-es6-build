const THREE = require('../three.js')
THREE.SelectionHelper = ( function () {

	function SelectionHelper( renderer, cssClassName ) {

		this.element = document.createElement( 'div' );
		this.element.classList.add( cssClassName );
		this.element.style.pointerEvents = 'none';

		this.renderer = renderer;

		this.startPoint = new THREE.Vector2();
		this.pointTopLeft = new THREE.Vector2();
		this.pointBottomRight = new THREE.Vector2();

		this.isDown = false;

		this.renderer.domElement.addEventListener( 'pointerdown', function ( event ) {

			if ( this.element ) {
				this.isDown = true;
				this.onSelectStart( event );
			}

		}.bind( this ) );

		this.renderer.domElement.addEventListener( 'pointermove', function ( event ) {

			if ( this.isDown && this.element ) {

				this.onSelectMove( event );

			}

		}.bind( this ) );

		this.renderer.domElement.addEventListener( 'pointerup', function ( event ) {

			if ( this.element ) {
				this.isDown = false;
				this.onSelectOver( event );
			}

		}.bind( this ) );

	}

	SelectionHelper.prototype.onSelectStart = function ( event ) {

		this.renderer.domElement.parentElement.appendChild( this.element );

		this.element.style.left = event.clientX + 'px';
		this.element.style.top = event.clientY + 'px';
		this.element.style.width = '0px';
		this.element.style.height = '0px';

		this.startPoint.x = event.clientX;
		this.startPoint.y = event.clientY;

	};

	SelectionHelper.prototype.onSelectMove = function ( event ) {

		this.pointBottomRight.x = Math.max( this.startPoint.x, event.clientX );
		this.pointBottomRight.y = Math.max( this.startPoint.y, event.clientY );
		this.pointTopLeft.x = Math.min( this.startPoint.x, event.clientX );
		this.pointTopLeft.y = Math.min( this.startPoint.y, event.clientY );

		this.element.style.left = this.pointTopLeft.x + 'px';
		this.element.style.top = this.pointTopLeft.y + 'px';
		this.element.style.width = ( this.pointBottomRight.x - this.pointTopLeft.x ) + 'px';
		this.element.style.height = ( this.pointBottomRight.y - this.pointTopLeft.y ) + 'px';

	};

	SelectionHelper.prototype.onSelectOver = function () {

		this.element.parentElement.removeChild( this.element );

	};

	return SelectionHelper;

} )();
