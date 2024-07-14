import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from './ui/radio';
import { solve } from './utils/kmap-solver';

const KMapSolver = () => {
  const [variables, setVariables] = useState(2);
  const [form, setForm] = useState('SOP');
  const [kmap, setKmap] = useState(Array(16).fill(0));
  const [simplifiedExpression, setSimplifiedExpression] = useState('');
  const [groups, setGroups] = useState([]);
  const kmapRef = useRef(null);
  const svgRef = useRef(null);

  const strokeColor = "#D1D5DB";

  useEffect(() => {
    const updateSvgPosition = () => {
      const kmapElement = kmapRef.current;
      const svgElement = svgRef.current;
      if (kmapElement && svgElement) {
        const rect = kmapElement.getBoundingClientRect();
        svgElement.style.top = `${rect.top}px`;
        svgElement.style.left = `${rect.left}px`;
        svgElement.style.width = `${rect.width}px`;
        svgElement.style.height = `${rect.height}px`;
      }
    };

    updateSvgPosition();
    window.addEventListener('resize', updateSvgPosition);

    return () => {
      window.removeEventListener('resize', updateSvgPosition);
    };
  }, []);

  const getGridSize = () => {
    switch (variables) {
      case 2: return [2, 2];
      case 3: return [2, 4];
      case 4: return [4, 4];
      default: return [2, 2];
    }
  };

  const getLabels = () => {
    switch (variables) {
      case 2: return {
        top: ['0', '1'],
        left: ['0', '1'],
        cornerTop: 'A',
        cornerLeft: 'B'
      };
      case 3: return {
        top: ['00', '01', '11', '10'],
        left: ['0', '1'],
        cornerTop: 'AB',
        cornerLeft: 'C'
      };
      case 4: return {
        top: ['00', '01', '11', '10'],
        left: ['00', '01', '11', '10'],
        cornerTop: 'AB',
        cornerLeft: 'CD'
      };
      default: return {
        top: ['0', '1'],
        left: ['0', '1'],
        cornerTop: 'A',
        cornerLeft: 'B'
      };
    }
  };

  const handleCellClick = (index) => {
    setKmap(kmap.map((cell, i) => i === index ? (cell + 1) % 3 : cell));
  };

  const setAllCells = (value) => {
    setKmap(Array(16).fill(value));
  };

  const [rows, cols] = getGridSize();
  const labels = getLabels();

  useEffect(() => {
    if (form === 'SOP') {
      const minterms = kmap
        .map((value, index) => value === 1 ? index : -1)
        .filter(index => index !== -1);

      const dontcares = kmap
        .map((value, index) => value === 2 ? index : -1)
        .filter(index => index !== -1);

      const variablesArr = ['A', 'B', 'C', 'D'].slice(0, variables);
      const result = solve(variablesArr, minterms, dontcares);

      setSimplifiedExpression(result.expression);
      setGroups(result.groups);
    }
  }, [kmap, form, variables]);

  const highlightStyles = [
    { backgroundColor: 'rgba(255, 182, 193, 0.5)', borderColor: 'rgba(255, 182, 193, 1)' },
    { backgroundColor: 'rgba(173, 216, 230, 0.5)', borderColor: 'rgba(173, 216, 230, 1)' },
    { backgroundColor: 'rgba(144, 238, 144, 0.5)', borderColor: 'rgba(144, 238, 144, 1)' },
    { backgroundColor: 'rgba(255, 255, 224, 0.5)', borderColor: 'rgba(255, 255, 224, 1)' }
  ];

  return (
    <div className="flex p-4 gap-4">
      <div className="w-1/4 space-y-4">
        <RadioGroup value={variables.toString()} onValueChange={(value) => setVariables(parseInt(value))}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="2" id="variables-2" />
            <label htmlFor="variables-2">2 variables</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3" id="variables-3" />
            <label htmlFor="variables-3">3 variables</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="4" id="variables-4" />
            <label htmlFor="variables-4">4 variables</label>
          </div>
        </RadioGroup>

        <RadioGroup value={form} onValueChange={(value) => setForm(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="SOP" id="form-sop" />
            <label htmlFor="form-sop">SOP</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="POS" id="form-pos" />
            <label htmlFor="form-pos">POS</label>
          </div>
        </RadioGroup>

        <Button onClick={() => setAllCells(0)}>Set all to 0</Button>
        <Button onClick={() => setAllCells(1)}>Set all to 1</Button>
        <Button onClick={() => setAllCells(2)}>Set all to X</Button>
      </div>

      <div style={{ width: '75%', position: 'relative' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{ position: 'absolute', top: '0', left: '0', transform: 'translate(-90%, -50%)', fontSize: '12px' }}>
            <div style={{ textAlign: 'left', marginLeft: '11.925rem' }}>{labels.cornerTop}</div>
            <div style={{ textAlign: 'center', marginLeft: '7.975rem' }}>{labels.cornerLeft}</div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `auto repeat(${cols}, 50px)`,
              gridTemplateRows: `auto repeat(${rows}, 50px)`,
            }}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}>
                <svg style={{ width: '100%', height: '100%' }}>
                  <line x1="0" y1="0" x2="100%" y2="100%" stroke={strokeColor} strokeWidth="1" />
                </svg>
              </div>
            </div>
            {labels.top.map((label, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: '12px', padding: '8px' }}>{label}</div>
            ))}
            {kmap.slice(0, rows * cols).map((cell, index) => {
              const groupIndex = groups.findIndex(group => group.some(gCell => gCell.decimal === index));
              const cellStyle = groupIndex !== -1 ? highlightStyles[groupIndex % highlightStyles.length] : {};

              return (
                <React.Fragment key={index}>
                  {index % cols === 0 && (
                    <div style={{ fontSize: '12px', textAlign: 'right', paddingRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      {labels.left[Math.floor(index / cols)]}
                    </div>
                  )}
                  <div
                    onClick={() => handleCellClick(index)}
                    className="w-full h-full flex items-center justify-center border cursor-pointer"
                    style={{
                      backgroundColor: cellStyle.backgroundColor,
                      border: groupIndex !== -1 ? `1px solid ${cellStyle.borderColor}` : ''
                    }}
                  >
                    {cell === 0 ? '0' : cell === 1 ? '1' : 'X'}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: '16px', fontSize: '16px', fontWeight: 'bold' }}>
      Simplified Expression: <span className="latex">{`${simplifiedExpression}`}</span>
        </div>
      </div>
    </div>
  );
};

export default KMapSolver;
