//MAIN
Beginning,		LDA ON_START		//printf(ZEROED>>)
				BSA Print			//
				LDA OP_START		//printf(OP)
				BSA Print			//
InputLoop1,		SKI					//Input Operator
				BUN InputLoop1		//
				INP					//
				STA OP				//scanf("%c", &op)
				OUT					//
				ADD EXIT			//
				SZA					//if(Sign - EXIT == 0)
				BUN GO_ON			//
				BUN OFF				//printf(TURNED OFF)			
GO_ON,			SKI					//
				BUN GO_ON			//
				INP					//
				LDA SIGN_START		//printf(SIGN)
				BSA Print			//
Input1,			SKI					//Input Sign +\-
				BUN Input1			//	
				INP					//
				STA Sign			//scanf("%c", &Sign)
				OUT					//PRINTF(SIGN)
SIGN_CR1,		SKI					//
				BUN SIGN_CR1
				INP					//			
				LDA NUMBER1_START	//printf(1ST: )
				BSA Print			//
				LDA	1ST_START
				BSA Get_digit
				STA 1ST
				LDA Sign  			//
				ADD MINUS			//
				SZA					//if(Sign - MINUS == 0)
				BUN THEN2			//
				LDA 1ST				//
				CMA					//
				INC					//2n's complement
				STA 1ST				//						
THEN2,			LDA SIGN_START		//printf(SIGN)
				BSA Print			//
Input2,			SKI					//Input Sign
				BUN Input2			//
				INP					//
				STA Sign			//scanf("%c", &Sign)
				OUT					//PRITNF(SIGN)
SIGN_CR2,		SKI					//
				BUN SIGN_CR2		//
				INP
				LDA NUMBER2_START	//printf(2ND: )
				BSA Print			//
				LDA	2ND_START
				BSA Get_digit
				STA 2ND
				LDA Sign  			//
				ADD MINUS			//
				SZA					//if(Sign - MINUS == 0)
				BUN MINUS_CHECK			//
				LDA 2ND				//
				CMA					//
				INC					//2n's complement
				STA 2ND				//						
MINUS_CHECK,	LDA OP				//check if the operator = minus (-)
				ADD MINUS			//
				SZA					//if(OP == '-')
				BUN P_CHECK			//
				LDA	2ND				//
				CMA					//
				INC					//2n's complement
				ADD	1ST				//
				BSA	PRINT_NUM		//printf(1ST-2ND)
				BUN	Beginning		//goto Beginning 
	
P_CHECK,		LDA OP				//check if the operator = plus (+)	
				ADD PLUS			//
				SZA					//if(OP == '+')
				BUN S_CHECK			//
				LDA	1ST				//
				ADD	2ND				//
				BSA	PRINT_NUM		//printf(1ST+2ND)
				BUN	Beginning		//goto Beginning 
				
S_CHECK,		LDA 1ST				//check what is the sign of the result
				SNA					//if(1ST<0)	
				BUN	BIG				//else
				LDA	2ND				//
				SNA					//if(2ND < 0)
				BUN N_RESULT		//-1ST, 2ND
				BUN P_RESULT		//-1ST, -2ND
BIG,			LDA 2ND				//
				SNA					//if(2ND < 0)
				BUN	P_RESULT		//1ST, 2ND
				BUN	N_RESULT		//1ST, -2ND 
				
P_RESULT,		SNA					//if(2ND < 0)
				BUN M_CHECK			//
				CMA					//
				INC					//2n's complement
				STA 2ND				//
				LDA 1ST				//
				CMA					//
				INC					//2n's complement
				STA 1ST				//
M_CHECK,		LDA OP				//check if the operator = multiplication (*)
				ADD	MP				//
				SZA					//if(OP == '*')
				BUN	D_CHECK			//
				BSA MULTI			//
				BSA	PRINT_NUM		//print(RESULT)
				BUN Beginning		//goto Beginning 
D_CHECK,		LDA	OP				//check if the operator = division (/)
				ADD	DEV				//
				SZA					//if( OP == '/')
				BUN Error_op		//printf(Error: Incorrect Operator!)
				LDA 2ND				//
				SZA					//if(2ND == 0)
				BUN	Then_dev		//
				BUN	Error_dev		//printf(Error: division by zero!)
Then_dev,		BSA Division		//
				LDA	RESULT			//
				BSA	PRINT_NUM		//printf(RESULT)
				LDA REMAIND_START	//printf(Remainder: )
				BSA Print			//printf(Remainder)
				LDA 1ST				//
				BSA	PRINT_NUM		//printf(RESULT)
				BUN Beginning		//goto Beginning 
			
N_RESULT,		SZA					//if(2ND == 0)
				SNA					//if(2ND != 0 && < 0)
				BUN MINUS_1ST		//
				CMA					//
				INC					//2n's complement
				STA 2ND				//
				BUN M_CHECK2		//
MINUS_1ST,		LDA 1ST				//
				CMA					//
				INC					//2n's complement
				STA	1ST				//
M_CHECK2,		LDA OP				//check if the operator = multiplication (*)
				ADD	MP				//
				SZA					//if(OP == '*')
				BUN	D_CHECK2		//
				BSA MULTI			//
				CMA					//
				INC					//2n's complement
				BSA	PRINT_NUM		//printf(RESULT)
				BUN Beginning		//goto Beginning 			
D_CHECK2,		LDA	OP				//check if the operator = division (/)
				ADD	DEV				//
				SZA					//if(OP == '/')
				BUN Error_op		//printf(Error: Incorrect Operator!)
				LDA 2ND				//
				SZA					//if(2ND == 0)
				BUN	Then_dev2		//
				BUN	Error_dev		//printf(Error: division by zero!)
Then_dev2,		BSA Division		//
				LDA	RESULT			//
				CMA					//
				INC					//2n's complement
				BSA	PRINT_NUM		//printf(RESULT)
				LDA REMAIND_START	//
				BSA Print			//printf(Remainder)
				LDA 1ST				//
				BSA	PRINT_NUM		//printf(RESULT)
				BUN Beginning		//goto Beginning 
						
Error_op,		LDA PtrOP_START		//	
				BSA	Print			//
				BUN	Beginning		//goto Beginning 
				
Error_dig,		LDA PtrDig_START	//
				BSA	Print			//
				BUN	Beginning		//goto Beginning 
				
Error_dev,		LDA	PtrDev_START	//
				BSA	Print			//
				BUN	Beginning		//goto Beginning 
				
OFF,			LDA PtrOFF_START	//
				BSA Print			//
				HLT					//Turnning off the calculator.
					
//SUBROUNTINS
//Checks whether the inserted number range includes the numbers 0-9.
Check,			HEX	200				//
				STA INDEX			//
				ADD MINUS_A0		//
				SZA					//if(PTR1ST I + MINUS_A0 == 0)
				BUN ELSE			//
				BUN THEN1			//
ELSE,			SPA					//if(PTR1ST I + MINUS_A0 > 0) 
				BUN	Error_dig		// 
				LDA INDEX			//
				ADD MINUS_A9		//
				SNA					//if(PTR1ST I + MINUS_A9 < 0) 
				BUN ELSE1			//
				BUN THEN1			//
ELSE1,			SZA					//if(PTR1ST I + MINUS_A9 == 0)
				BUN	Error_dig		//
THEN1,			LDA INDEX			//
				ADD MINUS_A0		//
				BUN	Check I			//

//function that Breaks down the number and prints it (RESULT)
PRINT_NUM,		HEX	620				//
				STA	RESULT			//
				LDA	RESULT_START	//
				BSA	Print			//Printf(“ = “)
				LDA	M_Power10_START	//
				STA	PTR				//PTR = POWER10ARRAY[PTR]
				LDA	RESULT			//
				SZA
				BUN Check_sign
				ADD ASCII_OFFSET
				OUT
				BUN	Beginning
Check_sign,		SNA					//IF (NUMBER <0)
				BUN	POSITIVE		//
NEGATIVE,		LDA	RESULT			//THEN		
				CMA					//
				INC					//
				STA SAME			//SAME = -NUMBER
				LDA	MINUS_SIGN		//
				OUT					//PRINTF(“-“)
				BUN	TURNING			//
POSITIVE,		LDA	RESULT			//ELSE SAME = NUMBER
				STA	SAME			//FI 
TURNING,		LDA	C4				//
				STA	T_count			//
FOR_LOOP,		LDA	T_count 		//FOR (T_count =4;T_count>0; T_count--)
				SPA					//
				BUN	END_FOR			//
				CLA					//DO DIGIT =0;
				STA	DIGIT			//
DO_LOOP,		LDA	PTR	I			//WHILE (SAME - POWER10ARRAY[PTR]>0)
				ADD	SAME			//DO
				SNA					//
				BUN	CONTINUE		//
				BUN	OUT_DIG			//
CONTINUE,		STA	SAME			//SAME=SAME - Power10Array[Ptr] ;
				ISZ	DIGIT			//DIGIT++;
				BUN	DO_LOOP			//END
OUT_DIG,		LDA	DIGIT			//	
				SPA					//if(digit > 0)
				BUN FLAG_CHECK		//
				BUN PRINT_OK		//
FLAG_CHECK,		LDA ZERO_FLAG		//
				SPA 				//if(ZERO_FLAG > 0)
				BUN PRINTEST		//	
PRINT_OK,		LDA DIGIT			//
				ADD ASCII_OFFSET	//
				OUT					//print(digit);
				LDA ZERO_FLAG		//
				INC					//
				STA ZERO_FLAG		//
PRINTEST,		ISZ	PTR				//PTR++;
				LDA	T_count			//
				ADD	MINUS1			//
				STA	T_count			//T_count--;
				BUN FOR_LOOP		//
END_FOR,		LDA	SAME			//
				ADD	ASCII_OFFSET	//	
				OUT					//printf(last DIGIT)
END1,			CLA					//	
				STA	PTR				//
				STA	ZERO_FLAG
				BUN PRINT_NUM I		//
							
//function that Breaks down the array, and puts him number								
Get_digit,		HEX	700
				STA	PTR
				STA	Addres			//
				LDA M_C5
				STA COUNT		 	// COUNT = -5;
				CLA 
				STA SUM			 	//SUM = 0 ;
Input,			SKI				 	//
				BUN Input		 	//
				INP				 	//Input
				OUT				 	//	print the digit
				STA PTR	I
				ADD	CR
				SZA				 	//	if (*ptr == enter)
				BUN Check_limits 	//
				BUN	Done		 	// then goto done;
Check_limits,	LDA	PTR	I
				BSA	Check		
				STA PTR	I			//	*ptr=check(*ptr);
				ISZ	PTR				//ptr++;
				ISZ	COUNT			//count++;
				BUN Input			//go to input;
Done,			LDA	Addres
				STA	PTR				//ptr = Addres;
				LDA	P_POWER10_START
				STA	POWER10		
Power_loop,		LDA	COUNT
				SZA					// if(count != 0)
				BUN	Promote			//then Promote
				BUN Change			//else Change
Promote,		ISZ	POWER10			// POWER10++;		
				LDA	COUNT	
				ADD	one
				STA	COUNT			//COUNT++;
				BUN	Power_loop		// goto Power_loop;
Change,			LDA	PTR	I
				SZA					//if(*ptr != 0)
				BUN	Adding			//then Adding
				BUN	NEXT			// else	NEXT 
Adding,			LDA	SUM
				ADD	POWER10	I
				STA SUM				//SUM += *POWER10;
				LDA	PTR	I
				ADD	MINUS1
				STA	PTR	I			//(*PTR)--;
				BUN	Change			//GOTO Change;
NEXT,			LDA	POWER10
				ADD	END_POWER10	
				SZA					//if(Addres of POWER10 != 204)
				BUN DOIT 			//THEN	DOIT
				BUN	Finish			//else	Finish
DOIT,			ISZ	POWER10			//POWER10++;
				ISZ	PTR				//PTR++;
				BUN	Change			//goto Change;
Finish,			LDA SUM
				BUN	Get_digit I		//return sum;
				
//division function 								
Division,		HEX	810				//
				LDA	2ND				//
				CMA					//
				INC					//
				STA 2ND				//Integer division: RESULT = 1ST / 2ND 
				CLA					//RESULT =0; 
				STA	RESULT			//
Loop,			LDA	2ND				//WHILE (1ST – 2ND >=0) 
				ADD	1ST				//DO 	
				SNA					//if(2ND+1ST < 0)
				BUN	Contin			//
				BUN OutDig 			//
Contin,			LDA	2ND				//  
				ADD	1ST				// 	
				STA	1ST				//1ST = 1ST – 2ND;   
				ISZ	RESULT			//RESULT++;
				BUN	Loop			//OD;
OutDig,			BUN	Division I		//return
		
//multiplication function				
MULTI,			HEX	760
				LDA 1ST				//
				SZA					//if(1ST==0)
				BUN IFELSE			//
				BUN	MULTI I			//printf( 0 )
				BUN	Beginning		//
IFELSE, 		STA COUNT			//
				CLA					//
				STA RESULT			//
WHILE,			LDA	COUNT			//
				SZA					//if(count==0)
				BUN	DO				//
				BUN OD				//
DO,				LDA	RESULT			//
				ADD	2ND				//
				STA RESULT			//
				LDA COUNT			//
				ADD	MINUS1			//
				STA COUNT			//
				BUN	WHILE			//
OD,				LDA	RESULT			//
				BUN	MULTI I			//

//printing function								
Print,			HEX	850				//
				STA	PTR		        //
WHILE1,			LDA PTR	I			//
				SZA					//
				BUN	BODY			//
				BUN	FINAL			//
BODY,			OUT					//
				ISZ	PTR				//
				BUN	WHILE1			//
FINAL,			BUN Print I			//
	
//DATA
one	,		dec	1
ZERO_FLAG,	HEX 0
RES_FINE,	HEX 0
MINUS_A0, 	HEX -30	
MINUS_A9,	HEX -39
PLUS,		HEX -2B
MINUS,		HEX -2D
MP,			HEX -2A
DEV,		HEX -2F
EQ, 		HEX 3D
CR,			HEX -D
EXIT,		HEX	-58
1ST,		DEC 0
1ST_START,	HEX	270
2ND,		DEC 0
2ND_START,	HEX 290
OP,			HEX 0
RESULT, 	HEX 0
Sign,		HEX 0
COUNT,		HEX	0
T_count, 	HEX	0
TEMP,		HEX	0
NINE,		DEC	9
MINUS1,		DEC	-1
PTR,		HEX	0
SAME,		HEX	0
ASCII_OFFSET,		HEX	30
C4,			DEC	4
M_C5,		DEC	-5
DIGIT,		DEC	0
MINUS_SIGN, 	HEX 2D
INDEX,		HEX	0
Addres,	HEX	0
SUM	,	HEX	0
POWER10,	HEX	0
END_POWER10,	HEX	-204

P_POWER10_START, HEX	200
		ORG	200
P_POWER10,	DEC	10000
			DEC	1000
			DEC	100
			DEC	10
			DEC 1


M_Power10_START,	HEX	250
			ORG	250
M_POWER10,	DEC	-10000
			DEC	-1000
			DEC	-100
			DEC	-10

		ORG 270
STR1ST, 	HEX 0
			HEX 0
			HEX 0
			HEX 0
			HEX 0
		
		ORG 290
STR2ND, 	HEX 0
			HEX 0
			HEX 0
			HEX 0
			HEX 0
		
PtrDig_START,		HEX 310 //Error: is not a digit!
		ORG 310
strDig,		HEX 45
			HEX	72
			HEX	72
			HEX	6F
			HEX	72
			HEX	3A
			HEX	69
			HEX	73
			HEX	20
			HEX	6E
			HEX	6F
			HEX	74
			HEX	20
			HEX	61
			HEX	20
			HEX	64
			HEX	69
			HEX	67
			HEX	69
			HEX	74
			HEX	21
			HEX	0

PtrDev_START,		HEX 330 //Error: division by zero!
		ORG 330
strDev,		HEX 45
			HEX	72
			HEX	72
			HEX	6F
			HEX	72
			HEX	3A
			HEX	69
			HEX	73
			HEX	20 
			HEX 64
			HEX 69
			HEX 76
			HEX 69
			HEX 73
			HEX 69
			HEX 6F
			HEX 6E
			HEX 20
			HEX 62
			HEX 79
			HEX 20
			HEX 7A
			HEX	65
			HEX	72
			HEX	6F
			HEX 21	
			HEX	0
			
PtrOP_START, 		HEX 360 //Error: Incorrect Operator!
		ORG 360   
strOp, 		HEX 45
			HEX 72
			HEX 72
			HEX 6F
			HEX 72
			HEX 3A
			HEX 20
			HEX 49
			HEX 6E
			HEX 63
			HEX 6F
			HEX 72
			HEX 72
			HEX 65
			HEX 63
			HEX 74
			HEX 20
			HEX 4F
			HEX 70
			HEX 65
			HEX 72
			HEX 61
			HEX 74
			HEX 6F
			HEX 72
			HEX 21 
			HEX 0
	

REMAIND_START,  	HEX 390 //Rmainder:
		ORG 390
strRem, 	HEX 20
			HEX 52
			HEX 65
			HEX 6D
			HEX 61
			HEX 69
			HEX 6E
			HEX 64
			HEX 65
			HEX 72
			HEX 0
			
PtrOFF_START,  		HEX 420 //TURNNED OFF;
		ORG 420   
strOFF, 	HEX 20
			HEX 54
			HEX 55
			HEX 52
			HEX 4E
			HEX 44
			HEX 20
			HEX 4F
			HEX 46
			HEX 46
			HEX 3B
			HEX 20
			HEX 0
						
			
ON_START,  			HEX 460 // ZEROED>>
		ORG 460   
strON, 		HEX 20
			HEX 5A
			HEX 45
			HEX 52
			HEX 4F
			HEX 45
			HEX 44
			HEX 3E
			HEX 3E
			HEX 20
			HEX 0
			
SIGN_START, 	 	HEX 500 // SIGN:
		ORG 500   
strSIGN, 	HEX 20
			HEX 53
			HEX 49
			HEX 47
			HEX 4E
			HEX 3A
			HEX 20
			HEX 0
			
NUMBER1_START,  	HEX 520 // 1ST: 
		ORG 520   
strNUM1, 	HEX 20
			HEX 31
			HEX 53
			HEX 54
			HEX 3A
			HEX 20
			HEX 0
			
NUMBER2_START,  	HEX 550 // 2ND: 
		ORG 550   
strNUM2, 	HEX 20
			HEX 32
			HEX 4E
			HEX 44
			HEX 3A
			HEX 20
			HEX 0			
				
OP_START, 		 	HEX 580 // OP: 
		ORG 580   
strOP2,		HEX 20
			HEX 4F
			HEX 50
			HEX 3A
			HEX 20
			HEX 0	
					
RESULT_START, 		 HEX 600// = ;
		ORG 600   
strRESULT,	HEX 20
			HEX 3D
			HEX 20
			HEX 0
			
			
			

			