import React,{ useState,useRef  } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function App()  {

	const [current, setCurrent] = useState(0);
	const [error, setError]=useState(null);			//GET error
	const [colors, setColor]=useState(['000']);		//color list
	const [manualError, setManualError]=useState(null);  
	const [inputValue,setInputValue]=useState('');	//user input value

	//dragging from from https://blog.usejournal.com/implementing-react-drag-and-drop-without-any-external-library-d7ec00437afb
	const draggingItem = useRef();
	const dragOverItem = useRef();
	const handleDragStart = (e, position) => {
		draggingItem.current = position;
	};
	const handleDragEnter = (e, position) => {
		dragOverItem.current = position;
	};
	//insert dragged item between items
	const handleDragEnd = (e) => {
		const listCopy = [...colors];
		const draggingItemContent = listCopy[draggingItem.current];
		listCopy.splice(draggingItem.current, 1);
		listCopy.splice(dragOverItem.current, 0, draggingItemContent);
		draggingItem.current = null;
		dragOverItem.current = null;
		setColor(listCopy);
	};
	 
    //this gets color from colr.org - there is a bug that fetches the same response after 1st on chrome
	//if not in developer mode
    const fetchColor = async() => {
	fetch("https://www.colr.org/json/color/random")
		.then(response => response.json())
		.then(data => {
			let fetchedColor=data.colors[0]["hex"];
			//sometimes colr.org gives response with empty 'hex' (timestamp is ok)
			//console.log(data.colors[0]);
			if (!fetchedColor || fetchedColor.length<3)
				return;
			if (colors.includes(fetchedColor))	//color already exists
			{
				setCurrent(colors.indexOf(fetchedColor));
			}
			else
			{
				setColor(colors => colors.concat(fetchedColor)); //add color
				setCurrent(colors.length);						 //and select
			}
			if (error)
				setError(null); //remove error if exists
		})
		.catch(e => {
                console.log(e);
                setError(e); //will be displayed to user
            });	
	}
	//on key 'Enter' check if input is valid color and add it to the list
	const onInputKeyDown = (event) => {
		if (event.key === 'Enter' && event.target.value.length>1)
		{
			let userColor=event.target.value;
			if (!isHex(userColor))	//check if color is valid
			{
				setManualError('Input is not valid hex color');
				return;
			}
			if (colors.includes(userColor))		//color already exists
			{
				setCurrent(colors.indexOf(userColor));	//so just select it
				setInputValue('');						//reset input value
			}
			else
			{
				setColor(colors => colors.concat(userColor)); //add color to list
				setCurrent(colors.length);		//mark as current color
				if (manualError) 
					setManualError(null);		//remove error if exists
				setInputValue('');				//reset input value
			}
		}
	}
	//store current input value so that it can be cleared if color is accepted
	const onInputChange = (event) => {
		if (event.key !== 'Enter')
		{
			setInputValue(event.target.value);
		}
	}
	//assemble color list that is draggable, has small div for color display as well as 
	//text indicating hex color. As text color could be the same or similar
	//to background there is 'backStyle' which alters list item background
 	const colorList=colors.map((color,position)=> {
		const desc='Color #'+color;
		const selStyle=position===current?'bolder':'normal';
		const backStyle=isDark(color)?'#B4B4B4':'#242A38';
		return (
				<li key={position} 
					className="listItem" draggable 
					style={{backgroundColor:backStyle}}
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
	//if there is an error, display it instead of default input label
	const userInput=manualError?manualError:'Enter color (hex value)';
	const buttonBG=isDark(colors[current])?'btn-light':'btn-secondary';//this should be set better
    return (
 	<>
		<div className="container controlContainer">
			 <div className="text-center">
				<h2>React test task - fetching random colors</h2>
				<div className="row buttonRow">
					<div className="col-6">
						<span>Click to fetch new color</span><br />
						<button 
							className={'btn fetchButton '+buttonBG}
							onClick={fetchColor} 
							style={{color:'#'+ colors[current]}}>
							FETCH COLOR 
						</button>
						<p>{error}</p>
					</div>
					<div className="col-6">
						<span>{userInput}</span><br />
						<input type='text' 
							onKeyDown={onInputKeyDown} 
							onChange={onInputChange} 
							value={inputValue}>
						</input>
					</div>
				</div>
				<div className="spacing"></div>
			</div>
		</div>	
		<div className="container listContainer">
			<ul>
			{colorList}
			</ul>
		</div>
	</>
	);
}

//helper to check if input value is hex color
function isHex(val)
{
  return typeof val === 'string' 
	  && (val.length===3 || val.length===6)
      && !isNaN(Number('0x' + val))
}
//from https://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black
//to determine if color is too dark for default background

//function from https://awik.io/determine-color-bright-dark-using-javascript/
function isDark(color) {

    // Variables for red, green, blue values
    var r, g, b, hsp;
    color = +("0x" + color.slice(1).replace( 
    color.length < 5 && /./g, '$&$&'));
    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
    
    hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
    );
    if (hsp>60) //even though 128 is standard limit, for this purpose I look only for really dark colors
		return false;
    return true;
}

ReactDOM.render(<App />, document.getElementById("root"));