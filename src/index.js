import React,{ useState,useRef  } from 'react';
import ReactDOM from 'react-dom';


function App()  {

	const [current, setCurrent] = useState(0);
	const [error, setError]=useState(null);
	const [colors, setColor]=useState(['000']);
	const [manualError, setManualError]=useState(null);

	//dragging from from https://blog.usejournal.com/implementing-react-drag-and-drop-without-any-external-library-d7ec00437afb
	const draggingItem = useRef();
	const dragOverItem = useRef();
	const handleDragStart = (e, position) => {
		draggingItem.current = position;
	};
	const handleDragEnter = (e, position) => {
		dragOverItem.current = position;
	};
	const handleDragEnd = (e) => {
		const listCopy = [...colors];
		const draggingItemContent = listCopy[draggingItem.current];
		listCopy.splice(draggingItem.current, 1);
		listCopy.splice(dragOverItem.current, 0, draggingItemContent);
		draggingItem.current = null;
		dragOverItem.current = null;
		setColor(listCopy);
	};
	 
    const fetchColor = async() => {
	fetch("https://www.colr.org/json/color/random")
		.then(response => response.json())
		.then(data => {
			let fetchedColor=data.colors[0]["hex"];
			//sometimes colr.org gives response with empty 'hex'
			//console.log(data.colors[0]);
			if (!fetchedColor || fetchedColor.length<3)
				return;
			if (colors.includes(fetchedColor))	//color already exists
			{
				setCurrent(colors.indexOf(fetchedColor));
			}
			else
			{
				setColor(colors => colors.concat(fetchedColor));
				setCurrent(colors.length);
			}
			setError('');
		})
		.catch(e => {
                console.log(e);
                setError(e);
            });	
	}
	const userColor = (event) => {
		//if color is a color, add it, else ignore
		if (event.key === 'Enter' && event.target.value.length>1)
		{
			if (isHex(event.target.value))
			{
				setColor(colors => colors.concat(event.target.value));
				setCurrent(colors.length);
				setManualError('');
			}
			else
			{
				setManualError('Input is not valid hex color');
			}
		}
	}
	  
 	const colorList=colors.map((color,position)=> {
		const desc='Color #'+color;
		const selStyle=position===current?'bolder':'normal';
		return (
				<li key={position} draggable 
					onDragStart={(e) => handleDragStart(e, position)}
					onDragEnter={(e) => handleDragEnter(e, position)}
					onDragEnd={handleDragEnd}>
				<div className='col-3' style={{display: 'inline',backgroundColor:'#'+color}}>&nbsp;</div>
				<button className='btn' onClick={()=>setCurrent(position)} 
					style={{fontWeight:selStyle, color:'#'+color}}>{desc}
				</button>
				</li>
				);
	});
	const userInput=manualError?manualError:'Enter color (hex value)';
    return (
			<div className='container'>
				<h2>React test task for fetching random colors</h2>
				<div className="row">
					<div className="col-6">
						<button 
							onClick={fetchColor} 
							style={{color:'#'+ colors[current]}}>
							Fetch new color
						</button>
						<p>{error}</p>
					</div>
					<div className="col-6">
						<span>{userInput}</span><br />
						<input type='text' onKeyDown={userColor}></input>
					</div>
				</div>
				<ul>
					{colorList}
				</ul>
			</div>
    );
   
}

//helper to check if input value is hex color
function isHex(val)
{
  return typeof val === 'string' 
	  && val.length>2 && val.length<7
      && !isNaN(Number('0x' + val))
}

ReactDOM.render(<App />, document.getElementById("root"));