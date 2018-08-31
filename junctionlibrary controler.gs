include "junctionlibrary base.gs"
include "browser.gs"





class zxMainJunctionController isclass zxMainJunctionControllerBase
{

StringTable ST1;


Soup ToSoupJL();
void FromSoupJL(Soup sp);


string Calculated="";
string Calculated2="";


public Browser mn = null;

bool Br_mode = false;
string junct_err_string="";




string MakeStationList();
void RefreshBrowser();



int currentStation=-1;

int currentSignalId=-1;

string part_of_st="";

bool reset_jun=false;


void SortAllStations();
void SortAllSignasAtStation(int Station_id);
void MainShowSignals();




bool Junct_init=false;
bool Sign_init = false;
bool Path_init = false;
bool Path_delete_init = false;

public bool Is_refresh = false;



thread void InitSignals_All()
	{

	Sign_init = true;



	int i,j,q=0;
	Signal[] s_list= World.GetSignalList();

	Soup SignalSoup;
	string station_name;

	string signal_name;

	
	StationProperties=Constructors.NewSoup();

	int p=0;
	int Station_id;

	int svetof_numb;

	for(i=0;i<s_list.size();i++)
		{
		q++;
		
		if(q>100)
			{
			Calculated2=ST1.GetString("now = ")+(string)(i*100/s_list.size())+"%";

			PostMessage(me,"Refresh","now",0.05);

			Sleep(0.1);

			q=0;
			}



		zxSignal Sign = cast<zxSignal>(s_list[i]);

		if(Sign)
			{
			int sign_type = Sign.Type;
			station_name = Sign.stationName;
			signal_name = Sign.privateName;

			if(sign_type>=1 and !(sign_type&32) and station_name!=""  and (!(sign_type&16) or sign_type&4  ))
				{

				//string a1311="search for "+station_name;
				//Interface.Log(a1311);


				Station_id=StationProperties.GetNamedTagAsInt(station_name,-1);
				
				if(Station_id>=0)
					{
					svetof_numb=StationProperties.GetNamedTagAsInt(station_name+".svetof_number",0);
					StationProperties.SetNamedTag(station_name+".svetof_number",(int)(svetof_numb+1));

					Soup sec_coup=Constructors.NewSoup();

					sec_coup.Copy(StationProperties.GetNamedSoup(station_name+".svetof_soup"));


					sec_coup.SetNamedTag("sv_n^"+svetof_numb,(s_list[i]).GetName());
					sec_coup.SetNamedTag("sv^"+svetof_numb,signal_name);
					sec_coup.SetNamedTag("sv_type^"+svetof_numb,sign_type);



					StationProperties.SetNamedSoup(station_name+".svetof_soup",sec_coup);

					}
				else
					{
					
					int st_num=StationProperties.GetNamedTagAsInt("st_Number",0)+1;

					StationProperties.SetNamedTag("st_Number",st_num);

					StationProperties.SetNamedTag(station_name,p);
					StationProperties.SetNamedTag("station_name_by_ID"+p,station_name);

					
					StationProperties.SetNamedTag(station_name+".svetof_number",1);


					Soup NewSoup=Constructors.NewSoup();
					NewSoup.SetNamedTag("sv_n^0",s_list[i].GetName());
					NewSoup.SetNamedTag("sv^0",signal_name);
					NewSoup.SetNamedTag("sv_type^0",sign_type);

					StationProperties.SetNamedSoup(station_name+".svetof_soup",NewSoup);
					

					p++;

					}
				}
			}
		}
	SortAllStations();



	int L=StationProperties.GetNamedTagAsInt("st_Number",0);


	for(i=0;i<L;i++)
		{
		SortAllSignasAtStation(i);
		Sleep(0.01);
		}

	IsInited2=true;
	Calculated2=ST1.GetString("alrady_finished");
	RefreshBrowser();

	Sign_init = false;

	PostMessage(me,"Refresh","stop",0.0);
	}




void Log_Signals()
	{
	int i,j,num;

	string Sname,a;

	Soup S_element;

	int station_number=StationProperties.GetNamedTagAsInt("st_Number",0);


	for(i=0;i<station_number;i++)
		{
		Sname=StationProperties.GetNamedTag("station_name_by_ID"+i);
		
		num=StationProperties.GetNamedTagAsInt(Sname+".svetof_number",0);
		S_element=StationProperties.GetNamedSoup(Sname+".svetof_soup");

		a="name "+Sname+" number of signals "+num;

		Interface.Log(a);


		for(j=0;j<num;j++)
			{
			a="svetofor "+j+" is "+S_element.GetNamedTag("sv^"+j) +" numb_of_paths "+S_element.GetNamedTag("sv_n^"+j)   ;
			Interface.Log(a);
			}
		}
	}






	bool Comp_str_FL2(string a,string b)
		{
		int i=0;

		while(i<=a.size())
			{
			if(i>=a.size())
				return true;
			if(i>=b.size())
				return false;

			if(a[i]>b[i])
				return false;
			if(a[i]<b[i])
				return true;
			++i;
		

			}


		return false;
		}



void SortAllStations()
	{
	int i, j,q;
	int L=StationProperties.GetNamedTagAsInt("st_Number",0)-1;

	string st_name1;
	string st_name2;
 
	for( i=0; i < L; i++) 
		{            
    		for( j = 0; j < L-i; j++ ) 
			{
     			q=j+1;


			st_name1=StationProperties.GetNamedTag("station_name_by_ID"+q);
			st_name2=StationProperties.GetNamedTag("station_name_by_ID"+j);


			if( Comp_str_FL2(st_name1 , st_name2))
				{
				StationProperties.SetNamedTag("station_name_by_ID"+j,  st_name1);
				StationProperties.SetNamedTag("station_name_by_ID"+q,  st_name2);

				StationProperties.SetNamedTag(st_name1,j);
				StationProperties.SetNamedTag(st_name2,q);

    				}
  			}
		}
	}





void SortAllSignasAtStation(int Station_id)
	{

	Soup Temp1;


	string ST_name = StationProperties.GetNamedTag("station_name_by_ID"+Station_id);
	Soup St_prop = StationProperties.GetNamedSoup(ST_name+".svetof_soup");
	int svetof_numb=StationProperties.GetNamedTagAsInt(ST_name+".svetof_number",0);


	int i, j,q;


	string Svetofor_name;
	string Svetofor_MAPname;	
	string Svetofor_Type;


	Soup NewSoup=Constructors.NewSoup();
	NewSoup.Copy(St_prop);
	
 
 	for( i=0; i < svetof_numb; i++) 
		{            
    		for( j =svetof_numb-1; j > i; j-- ) 
			{     
      			q=j-1;
			
			if(Comp_str_FL2(NewSoup.GetNamedTag("sv^"+j) , NewSoup.GetNamedTag("sv^"+q)) )
				{
				Svetofor_MAPname=NewSoup.GetNamedTag("sv_n^"+q);
				Svetofor_name=NewSoup.GetNamedTag("sv^"+q);
				Svetofor_Type=NewSoup.GetNamedTag("sv_type^"+q);
				NewSoup.SetNamedTag("sv_paths_number^"+q,0);

				NewSoup.SetNamedTag("sv_n^"+q,NewSoup.GetNamedTag("sv_n^"+j)   );
				NewSoup.SetNamedTag("sv^"+q,NewSoup.GetNamedTag("sv^"+j));
				NewSoup.SetNamedTag("sv_type^"+q,NewSoup.GetNamedTag("sv_type^"+j));

				NewSoup.SetNamedTag("sv_paths_number^"+j,0);
				NewSoup.SetNamedTag("sv_n^"+j,Svetofor_MAPname);
				NewSoup.SetNamedTag("sv^"+j,Svetofor_name);
				NewSoup.SetNamedTag("sv_type^"+j,Svetofor_Type);
    				}
  			}
		}


	StationProperties.SetNamedSoup(ST_name+".svetof_soup",NewSoup);

	}



thread void InitJunctions_All()
	{
	Junct_init = true;



	int i;

	Calculated=ST1.GetString("Is_going");


	BSJunctionLib=new BinarySortedArrayS();

	Junction[] j_list=World.GetJunctionList();

	JuctionWithProperties[] J_element=new JuctionWithProperties[j_list.size()+10];
	
	GSTrackSearch GSTS_Initing;

	int OldDir;

	MapObject[] MO_arr=new MapObject[4];

	bool[] Obj_direction= new bool[4];

	int q=0;

	int p;

	string J_obj_name="";

	junct_err_string="";

	for(i=0;i<j_list.size()+5;i++)
		J_element[i]=new JuctionWithProperties();
		
	BSJunctionLib.UdgradeArraySize( j_list.size()+40 );

		
	for(i=0;i<j_list.size();i++)
		{
		q++;
		if(q>100)
			{
			Calculated=ST1.GetString("now")+(string)(i*100/j_list.size())+"%";


			PostMessage(me,"Refresh","now",0.2);

			Sleep(0.5);
			q=0;
			}

		bool broken1 = false;
		
		OldDir=j_list[i].GetDirection();
		
		J_element[i].OldDirection=OldDir;
		

		j_list[i].SetDirection(Junction.DIRECTION_LEFT);
		
		GSTS_Initing=j_list[i].BeginTrackSearch(true);

		MO_arr[0]=GSTS_Initing.SearchNext();
		while(MO_arr[0] and (MO_arr[0].GetName()=="" or MO_arr[0].isclass(Vehicle) or !MO_arr[0].isclass(Trackside)))
 			MO_arr[0]=GSTS_Initing.SearchNext();

		if(MO_arr[0])
			Obj_direction[0]=  GSTS_Initing.GetFacingRelativeToSearchDirection();
		else
			broken1 = true;

		
		GSTS_Initing=j_list[i].BeginTrackSearch(false);

		MO_arr[1]=GSTS_Initing.SearchNext();
		while(MO_arr[1] and (MO_arr[1].GetName()=="" or MO_arr[1].isclass(Vehicle) or !MO_arr[1].isclass(Trackside)))
			MO_arr[1]=GSTS_Initing.SearchNext();
 
		if(MO_arr[1])
			Obj_direction[1]=  GSTS_Initing.GetFacingRelativeToSearchDirection();
		else
			broken1 = true;


		j_list[i].SetDirection(Junction.DIRECTION_RIGHT);

		GSTS_Initing=j_list[i].BeginTrackSearch(true);

		MO_arr[2]=GSTS_Initing.SearchNext(); 
		while(MO_arr[2] and (MO_arr[2].GetName()=="" or MO_arr[2].isclass(Vehicle) or !MO_arr[2].isclass(Trackside)))
			MO_arr[2]=GSTS_Initing.SearchNext();

		if(MO_arr[2])
			Obj_direction[2]=  GSTS_Initing.GetFacingRelativeToSearchDirection();
		else
			broken1 = true;

		
		GSTS_Initing=j_list[i].BeginTrackSearch(false);

		MO_arr[3]=GSTS_Initing.SearchNext(); 
		while(MO_arr[3] and (MO_arr[3].GetName()=="" or MO_arr[3].isclass(Vehicle) or !MO_arr[3].isclass(Trackside)))
			MO_arr[3]=GSTS_Initing.SearchNext();

		if(MO_arr[3])
			Obj_direction[3]=  GSTS_Initing.GetFacingRelativeToSearchDirection();
		else
			broken1 = true;

		j_list[i].SetDirection(OldDir);


		if(!MO_arr[0] and MO_arr[1] and MO_arr[2] and MO_arr[3])
			junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"1"+ST1.GetString("err_info_2")+ j_list[i].GetName()+ ST1.GetString("err_info_3") +MO_arr[1].GetName() +"', '"+ MO_arr[2].GetName() +"', '"+ MO_arr[3].GetName()+"<br>";

		else if(MO_arr[0] and !MO_arr[1] and MO_arr[2] and MO_arr[3])
			junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"1"+ST1.GetString("err_info_2")+ j_list[i].GetName()+ ST1.GetString("err_info_3")+MO_arr[0].GetName() +"', '"+ MO_arr[2].GetName() +"', '"+ MO_arr[3].GetName()+"'<br>";

		else if(MO_arr[0] and MO_arr[1] and !MO_arr[2] and MO_arr[3])
			junct_err_string=junct_err_string+ST1.GetString("err_info_1")+"1"+ST1.GetString("err_info_2")+ j_list[i].GetName()+ ST1.GetString("err_info_3")+MO_arr[0].GetName() +"', '"+ MO_arr[1].GetName() +"', '"+ MO_arr[3].GetName()+"'<br>";

		else if(MO_arr[0] and MO_arr[1] and MO_arr[2] and !MO_arr[3])
			junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"1"+ST1.GetString("err_info_2")+ j_list[i].GetName()+ ST1.GetString("err_info_3")+MO_arr[0].GetName() +"', '"+ MO_arr[1].GetName() +"', '"+ MO_arr[2].GetName()+"'<br>";
		else if(!broken1)
			{
			if(MO_arr[0] == MO_arr[1] and MO_arr[2] == MO_arr[3])
				junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"3"+ST1.GetString("err_info_2")+ j_list[i].GetName()+ ST1.GetString("err_info_3")+MO_arr[0].GetName() +"', '"+ MO_arr[2].GetName()+"'<br>";

			else if(MO_arr[0] == MO_arr[2] and MO_arr[1] == MO_arr[3])
				junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"3"+ST1.GetString("err_info_2")+ j_list[i].GetName()+ ST1.GetString("err_info_3")+MO_arr[0].GetName() +"', '"+ MO_arr[1].GetName()+"'<br>";

			else if(MO_arr[0] == MO_arr[3] and MO_arr[1] == MO_arr[2])
				junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"3"+ST1.GetString("err_info_2")+ j_list[i].GetName()+ ST1.GetString("err_info_3")+MO_arr[0].GetName() +"', '"+ MO_arr[1].GetName()+"'<br>";

			}
		else
			junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"2"+ST1.GetString("err_info_2")+j_list[i].GetName()+"'<br>";
	

		if(MO_arr[1] and MO_arr[1]==MO_arr[3])
			{
			if(MO_arr[1].isclass(Junction))
				J_element[i].back_dir=-1;
			else
				{
				if(Obj_direction[1])
					J_element[i].back_dir=1;
				else
					J_element[i].back_dir=0;
				}
			J_element[i].back=MO_arr[1];

			if(MO_arr[0])
				{
				if(MO_arr[0].isclass(Junction))
					J_element[i].frontLeft_dir=-1;
				else
					{
					if(Obj_direction[0])
						J_element[i].frontLeft_dir=1;
					else
						J_element[i].frontLeft_dir=0;
					}

				J_element[i].frontLeft=MO_arr[0];
				}
			else
				{
				J_element[i].frontLeft_dir=1;
				J_element[i].frontLeft=null;
				}

			if(MO_arr[2])
				{
				if(MO_arr[2].isclass(Junction))
					J_element[i].frontRight_dir=-1;
				else
					{
					if(Obj_direction[2])
						J_element[i].frontRight_dir=1;
					else
						J_element[i].frontRight_dir=0;
					}

				J_element[i].frontRight=MO_arr[2];
				}
			else
				{
				J_element[i].frontRight=null;
				J_element[i].frontRight_dir=1;
				}


			}



		if(MO_arr[0] and MO_arr[0]==MO_arr[2])
			{
			if(MO_arr[0].isclass(Junction))
				J_element[i].back_dir=-1;
			else
				{
				if(Obj_direction[0])
					J_element[i].back_dir=1;
				else
					J_element[i].back_dir=0;
				}
			J_element[i].back=MO_arr[0];


			if(MO_arr[1])
				{
				if(MO_arr[1].isclass(Junction))
					J_element[i].frontLeft_dir=-1;
				else
					{
					if(Obj_direction[1])
						J_element[i].frontLeft_dir=1;
					else
						J_element[i].frontLeft_dir=0;
					}

				J_element[i].frontLeft=MO_arr[1];
				}
			else
				{
				J_element[i].frontLeft_dir=1;
				J_element[i].frontLeft=null;
				}

			
			if(MO_arr[3])
				{
				if(MO_arr[3].isclass(Junction))
					J_element[i].frontRight_dir=-1;
				else
					{
					if(Obj_direction[3])
						J_element[i].frontRight_dir=1;
					else
						J_element[i].frontRight_dir=0;
					}
				J_element[i].frontRight=MO_arr[3];
				}
			else
				{
				J_element[i].frontRight=null;
				J_element[i].frontRight_dir=1;
				}

			}

		J_element[i].Permit_done=0;
		J_element[i].Poshorstnost=false;
		J_element[i].JunctPos=1;


		GSTS_Initing=j_list[i].BeginTrackSearch(true);
		MO_arr[0]=GSTS_Initing.SearchNext();

		p=0;
		while(MO_arr[0] and MO_arr[0].isclass(Trackside) and p<3)
			{
			MO_arr[0]=GSTS_Initing.SearchNext();
			p++;
			}
		if(MO_arr[0] and !MO_arr[0].isclass(Trackside))
			{
			J_obj_name = MO_arr[0].GetAsset().GetConfigSoup().GetNamedTag("username");
			Str.ToUpper(J_obj_name);
			if(J_obj_name[J_obj_name.size()-2,]=="_L" or J_obj_name[J_obj_name.size()-2,]==" L" or J_obj_name[J_obj_name.size()-3,J_obj_name.size()-1]=="_L")
				J_element[i].directionF=0;
			else
				J_element[i].directionF=2;
			}
		else
			J_element[i].directionF=2;

		if(BSJunctionLib.Find(j_list[i].GetName(),false)>=0)
			{
			string s34="rename junction "+j_list[i].GetName();
			Interface.Exception(s34);
			return;
			}


		
		BSJunctionLib.AddElement((string)(j_list[i].GetName()),(cast<GSObject>(J_element[i])));
		}

	IsInited=true;

	cache2.Clear();
	cache2.Copy(ToSoupJL());

	if(junct_err_string!="")
		{

		junct_err_string = ST1.GetString("junct_err_info")+junct_err_string;

		Br_mode = true;
		MainShowSignals();
		}


	Calculated=ST1.GetString("alrady_finished");

	Junct_init = false;

	PostMessage(me,"Refresh","stop",0.0);
	}




Soup ToSoupJL()
	{
	int i;
	Soup sp3=Constructors.NewSoup();

	JuctionWithProperties J_element;

	for(i=0;i<BSJunctionLib.N;i++)
		{
		J_element=cast<JuctionWithProperties>(BSJunctionLib.DBSE[i].Object);

		if(J_element.back)
			{
			sp3.SetNamedTag((string)(BSJunctionLib.DBSE[i].a)+".back",(J_element.back).GetName());
			sp3.SetNamedTag((string)(BSJunctionLib.DBSE[i].a)+".back_dir",J_element.back_dir);
			}

		if(J_element.frontLeft)
			{
			sp3.SetNamedTag((string)(BSJunctionLib.DBSE[i].a)+".frontLeft",(J_element.frontLeft).GetName());
			sp3.SetNamedTag((string)(BSJunctionLib.DBSE[i].a)+".frontLeft_dir",J_element.frontLeft_dir);
			}

		if(J_element.frontRight)
			{
			sp3.SetNamedTag((string)(BSJunctionLib.DBSE[i].a)+".frontRight",(J_element.frontRight).GetName());
			sp3.SetNamedTag((string)(BSJunctionLib.DBSE[i].a)+".frontRight_dir",J_element.frontRight_dir);
			}

		sp3.SetNamedTag((string)(BSJunctionLib.DBSE[i].a)+".OldDirection",J_element.OldDirection);
		sp3.SetNamedTag((string)(BSJunctionLib.DBSE[i].a)+".directionF",J_element.directionF);
		sp3.SetNamedTag((string)(BSJunctionLib.DBSE[i].a)+".Permit_done",J_element.Permit_done);
		sp3.SetNamedTag((string)(BSJunctionLib.DBSE[i].a)+".Poshorstnost",J_element.Poshorstnost);
		sp3.SetNamedTag((string)(BSJunctionLib.DBSE[i].a)+".JunctPos",J_element.JunctPos);
		sp3.SetNamedTag((string)(BSJunctionLib.DBSE[i].a)+".PrevJunction",J_element.PrevJunction);
		sp3.SetNamedTag((string)(BSJunctionLib.DBSE[i].a)+".LinkedSignal",J_element.LinkedSignal);


		sp3.SetNamedTag((string)("soup_name_"+i),(string)(BSJunctionLib.DBSE[i].a));
		}


	sp3.SetNamedTag("my_volume1",(int)(BSJunctionLib.N));

	return sp3;
	}


void FromSoupJL(Soup sp7)
	{
	int i;

	int size11=sp7.GetNamedTagAsInt("my_volume1",-1);

//string sq="i tterdsdsd____"+size11+"_____________";
//Interface.Log(sq);
			

	if(size11<=0)
		return;

	BSJunctionLib.N=0;

	BSJunctionLib.UdgradeArraySize(size11);

	
	string J_name;
	string temp_string1;

	BSJunctionLib.N=size11;

	JuctionWithProperties[] J_element=new JuctionWithProperties[size11];


	for(i=0;i<size11;i++)
		{
		J_element[i]=new JuctionWithProperties();
		
		J_name=sp7.GetNamedTag((string)("soup_name_"+i));

		
		
		temp_string1=sp7.GetNamedTag(J_name+".back");
		if(temp_string1!="")
			J_element[i].back = cast<MapObject>Router.GetGameObject(temp_string1);
		else
			J_element[i].back = null;
		J_element[i].back_dir =(int) sp7.GetNamedTagAsInt(J_name+".back_dir",1);


		temp_string1=sp7.GetNamedTag(J_name+".frontLeft");
		if(temp_string1!="")
			J_element[i].frontLeft = cast<MapObject>Router.GetGameObject(temp_string1);
		else
			J_element[i].frontLeft = null;
		J_element[i].frontLeft_dir =  sp7.GetNamedTagAsInt(J_name+".frontLeft_dir",1);


		temp_string1=sp7.GetNamedTag(J_name+".frontRight");
		if(temp_string1!="")
			J_element[i].frontRight = cast<MapObject>Router.GetGameObject(temp_string1);
		else
			J_element[i].frontRight = null;
		J_element[i].frontRight_dir = sp7.GetNamedTagAsInt(J_name+".frontRight_dir",1);

		
		J_element[i].OldDirection = sp7.GetNamedTagAsInt(J_name+".OldDirection",0);
		J_element[i].directionF = sp7.GetNamedTagAsInt(J_name+".directionF",0);
		J_element[i].Permit_done = sp7.GetNamedTagAsInt(J_name+".Permit_done",0); 
		J_element[i].Poshorstnost = sp7.GetNamedTagAsBool(J_name+".Poshorstnost",false);
		J_element[i].JunctPos = sp7.GetNamedTagAsInt(J_name+".JunctPos",1); 			
		J_element[i].PrevJunction = sp7.GetNamedTagAsInt(J_name+".PrevJunction",-1);
		J_element[i].LinkedSignal = sp7.GetNamedTag(J_name+".LinkedSignal");


		if(PathLib.Find(J_element[i].Permit_done,false)<0)
			J_element[i].Permit_done =0;
		
		BSJunctionLib.DBSE[i].a =J_name;
		BSJunctionLib.DBSE[i].Object=cast<GSObject>J_element[i];
		
		}

	IsInited=true;
	Calculated=ST1.GetString("alrady_finished");


	}


void Log_Junctions()
	{
	int i;

	string a;
	string b;
	string c;

	JuctionWithProperties J_element;

	for(i=0;i<BSJunctionLib.N;i++)
		{
		a="";
		b="";
		c="";

		J_element=cast<JuctionWithProperties>(BSJunctionLib.DBSE[i].Object);

		if(J_element.frontLeft)
			a=(J_element.frontLeft).GetName();
		if(J_element.frontRight)
			b=(J_element.frontRight).GetName();
		if(J_element.back)
			c=(J_element.back).GetName();
		
		a=BSJunctionLib.DBSE[i].a+": back "+c+" "+J_element.back_dir+" left "+a+" "+J_element.frontLeft_dir+" right "+b+" "+J_element.frontRight_dir+" otklonenie = "+J_element.directionF;

		Interface.Log(a);
		
		}
	

	} 





public string GetDescriptionHTML(void)
        {
        string s = inherited();
	string StationsListStr="";


	StationsListStr=MakeStationList();

        
	s=s+HTMLWindow.MakeTable
		(

		HTMLWindow.MakeRow
			(
			HTMLWindow.MakeCell
				(
				HTMLWindow.MakeLink("live://property/seachforjunctions",ST1.GetString("Initalljunctions")+Calculated+" ")
				)+
			HTMLWindow.MakeCell
				(
				HTMLWindow.MakeLink("live://property/err_junctions",ST1.GetString("err_junctions"))
				)
			)+
		HTMLWindow.MakeRow
			(
			HTMLWindow.MakeCell
				(
				HTMLWindow.MakeLink("live://property/initsignas",ST1.GetString("Init_all_z7signals")+Calculated2+" ")
				)+
			HTMLWindow.MakeCell
				(
				HTMLWindow.MakeLink("live://property/station_browser",ST1.GetString("output_signals"))
				)
			)+

		HTMLWindow.MakeRow
			(
			HTMLWindow.MakeCell
				(
				" ."
				)+
			HTMLWindow.MakeCell
				(
				" "
				)
			)+

		StationsListStr
		);


    	return s;
        }



void AnsweringHander(Message msg)
	{
	if(msg.minor=="Find_Junction_Path_base")
		PostMessage(msg.src,"TJunction_Path_sourceA",me.GetId(),0);



	}


public string GetPropertyType2(string propertyID)
        {
	if(propertyID[0,10]=="svetofor_m")
		return "int,-1,100,1";
        return "link";
        }

string GetPropertyType(string propertyID)
        {
	return GetPropertyType2(propertyID);
        }



string MakeStationList()
	{
	string output="";

	string other="";


	int i,j,k;

	int L=StationProperties.GetNamedTagAsInt("st_Number",0);

	for(i=0;i<L;i++)
		{
		if(i==currentStation)
			other=part_of_st;
		else
			other="";

		output=output+	HTMLWindow.MakeRow
			(
			HTMLWindow.MakeCell
				(
				HTMLWindow.MakeLink("live://property/station_p^"+i, StationProperties.GetNamedTag("station_name_by_ID"+i))+" . "+HTMLWindow.MakeLink("live://property/station_init^"+i, ST1.GetString("initiate"))+" . "+ HTMLWindow.MakeLink("live://property/station_d^"+i, ST1.GetString("deldubl"))+other
				)
			);
		if(i==currentStation)
			{
			string ST_name = StationProperties.GetNamedTag("station_name_by_ID"+i);
			Soup St_prop = StationProperties.GetNamedSoup(ST_name+".svetof_soup");
			int svetofnumber1=StationProperties.GetNamedTagAsInt(ST_name+".svetof_number",0);

			for(j=0;j<svetofnumber1;j++)
				{

				if( St_prop.GetNamedTagAsInt("sv_type^"+j,0)&(2+4+8) )
					{
					output=output+


					HTMLWindow.MakeRow
					(
					HTMLWindow.MakeCell
						(

					HTMLWindow.MakeTable	(

					HTMLWindow.MakeRow
					(
					HTMLWindow.MakeCell
						(
						" "
						)+
					HTMLWindow.MakeCell
						(
						HTMLWindow.MakeLink("live://property/svetofor_p^"+j, St_prop.GetNamedTag((string)("sv^"+j)))
						)+
					HTMLWindow.MakeCell
						(
						" . "+HTMLWindow.MakeLink("live://property/svetofor+p^"+j, ST1.GetString("initiate2"))+" . "+ HTMLWindow.MakeLink("live://property/svetofor_d^"+j, ST1.GetString("deldubl2"))
						)
					))));


					if(j==currentSignalId)
						{
						int SizeOfPaths=St_prop.GetNamedTagAsInt("sv_paths_number^"+j,-1);
							
						output=output+HTMLWindow.MakeRow
						(
						HTMLWindow.MakeCell
							(
							" "
							)+
						HTMLWindow.MakeCell
							(
							ST1.GetString("help")
							)
						);


						if(SizeOfPaths>0)
							{

							for(k=0;k<SizeOfPaths;k++)
								{
								Soup Old_sp=St_prop.GetNamedSoup("sv_^"+currentSignalId+"^"+k);
								int dd=Old_sp.GetNamedTagAsInt("NumberOfObjects");
								string objects9="";
								int qq;
								for(qq=0;qq<dd;qq++)
									objects9=objects9+" "+Old_sp.GetNamedTag("object_"+qq);

								float len=Old_sp.GetNamedTagAsFloat("object_length",-1);

								if(len>0)
									objects9=objects9+" "+(int)len+ST1.GetString("meter");

								objects9=objects9+"<br>"+Old_sp.GetNamedTag("object_ending");

								int priority1=Old_sp.GetNamedTagAsInt("object_priority",0);


								output=output+	HTMLWindow.MakeRow
								(
								HTMLWindow.MakeCell
									(
									" "+k+") "+
									HTMLWindow.MakeLink("live://property/svetofor_m^"+j+"^"+k, ST1.GetString("priority"))+": "+
									HTMLWindow.MakeLink("live://property/svetofor_m^"+j+"^"+k, priority1)+". "+
									HTMLWindow.MakeLink("live://property/svetofor_x^"+j+"^"+k, "X")
									)+
								HTMLWindow.MakeCell
									(
									objects9
									)
								);



								}

							}


						}
					}



				}
			}

		}
	return output;


	}



thread void InitStation(int currentStation)
	{
	Path_init = true;


	int i;
	int N=StationProperties.GetNamedTagAsInt(StationProperties.GetNamedTag("station_name_by_ID"+ currentStation)+".svetof_number",0);
	Soup St_prop = StationProperties.GetNamedSoup(StationProperties.GetNamedTag("station_name_by_ID"+ currentStation)+".svetof_soup");



	for(i=0;i<N;i++)
		{
		part_of_st=" "+(string)(i*100/N)+"%";

		if(St_prop.GetNamedTagAsInt("sv_type^"+i,0)&(2+4+8))
			{
			MakeAllPathsFromSignal(currentStation,i);

			PostMessage(me,"Refresh","now",0.1);

			Sleep(0.3);
			}
		}

	part_of_st="";


	Path_init = false;

	PostMessage(me,"Refresh","stop",0.0);
	}



bool DeleteLongAltPaths(string ST_name, int SignalId, int pathN)
	{

	int i,j,k,d;


	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);

	string curr_dst=sp1.GetNamedTag("object_ending");


	zxSignal sign1 = cast<zxSignal>(Router.GetGameObject(   sv_sp.GetNamedTag("sv_n^"+SignalId)   ) );
	MapObject MO;

	GSTrackSearch GSTS1;
	string[] tmpstr2;
	int temp_id;	


	string s7564;

//s7564="direction "+dir2+" Lid "+JunctLghtId;
//Interface.Log(s7564);



	reset_jun=true;

	int SizeOfPaths=sv_sp.GetNamedTagAsInt("sv_paths_number^"+SignalId,-1);

	float[] lengthA=new float[SizeOfPaths];
	int[] Id_A=new int[SizeOfPaths];

	int lenA_num=0;
	string dst_name;

	
	for(k=0;k<SizeOfPaths;k++) 
		{
		Soup Old_sp=sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+k);
		if(Old_sp.GetNamedTag("object_ending") == curr_dst)
			{

//			s7564="main id1 = "+curr_dst;
//			Interface.Log(s7564);


			
			int JunctionsNumber2=Old_sp.GetNamedTagAsInt("NumberOfObjects",0);
			i=0;
			Junction Jn1;
			while(i<JunctionsNumber2)
				{
				tmpstr2=Str.Tokens(Old_sp.GetNamedTag("object_"+i),",");
				temp_id=BSJunctionLib.Find(tmpstr2[0],false);
							
				Jn1 = cast<Junction>Router.GetGameObject(  BSJunctionLib.DBSE[temp_id].a);

				Jn1.SetDirection(Str.ToInt(tmpstr2[1]));
				i++;	
				}

			if(Str.Tokens(  sp1.GetNamedTag("object_ending"),"@" ).size()==2)
				dst_name= Str.Tokens(  sp1.GetNamedTag("object_ending"),"@" )[0];
			else
				dst_name=sp1.GetNamedTag("object_ending");


	//		s7564="main name = "+dst_name;
	//		Interface.Log(s7564);

	
			GSTS1=(cast<Trackside>sign1).BeginTrackSearch(true);

			MO=GSTS1.SearchNext();
			
			while(MO and MO.GetProperties().GetNamedTag("privateName") != dst_name)
				MO=GSTS1.SearchNext();
				
			lengthA[lenA_num]=GSTS1.GetDistance();

			//s7564="main dist = "+lengthA[lenA_num];
			//Interface.Log(s7564);

			Id_A[lenA_num]=k;

			lenA_num++;
			}
		}

	if(lenA_num <= 1)
		return false;
		

	float best_d=lengthA[0]+2;
	int best_id=0;
		
	for(k=0;k<lenA_num;k++)
		{
		if(lengthA[k]<best_d)
			{
			best_d=lengthA[k];
			best_id=Id_A[k];
			}
		}			

	Soup sp2;


//			s7564="best = "+best_id+" dist = "+best_d;
//			Interface.Log(s7564);



	for(k=0;k<lenA_num;k++)
		{
		if(Id_A[k] == best_id)
			{
			sp1=Constructors.NewSoup();
			sp2=Constructors.NewSoup();

			sp1.Copy(StationProperties.GetNamedSoup(ST_name +".svetof_soup"));

			string sv_1name="sv_^"+SignalId+"^"+Id_A[k];

			sp2.Copy(sp1.GetNamedSoup(sv_1name));

			sp2.SetNamedTag("alternative_r",false);

			sp1.SetNamedSoup(sv_1name,sp2);

			StationProperties.SetNamedSoup(ST_name +".svetof_soup",sp1);


//			s7564="setted = "+Id_A[k];
//			Interface.Log(s7564);



			}
		else
			{
			Soup sp1=Constructors.NewSoup();

			sp1.Copy(StationProperties.GetNamedSoup(ST_name +".svetof_soup"));

			string sv_1name="sv_^"+SignalId+"^"+Id_A[k];

			sp1.RemoveNamedTag(sv_1name);

//			s7564="deletted = "+Id_A[k];
//			Interface.Log(s7564);

			StationProperties.SetNamedSoup(ST_name +".svetof_soup",sp1);
			}
		}			


	int delta1=0;



	sp1=Constructors.NewSoup();

	sp1.Copy(StationProperties.GetNamedSoup(ST_name +".svetof_soup"));
	
	for(k=0;k<SizeOfPaths;k++) 
		{
		sp2=Constructors.NewSoup();

		string sv_1name="sv_^"+SignalId+"^"+k;

		if(sp1.GetNamedSoup(sv_1name).GetNamedTag("object_ending")!=""    )
			{
			sp2.Copy(sp1.GetNamedSoup(sv_1name));
			sv_1name="sv_^"+SignalId+"^"+(int)(k-delta1);
			sp1.SetNamedSoup(sv_1name,sp2);

//			s7564="OK = "+sv_1name;
//			Interface.Log(s7564);



			}
		else
			{
			delta1++;

//			s7564="delta = "+delta1;
//			Interface.Log(s7564);

			}
		}



	sp1.SetNamedTag("sv_paths_number^"+SignalId,(SizeOfPaths-delta1));

	StationProperties.SetNamedSoup(ST_name +".svetof_soup",sp1);
			

	return true;
	}

thread void DeletePathSignal(int station, int sign_id)
	{
	string ST_name = StationProperties.GetNamedTag("station_name_by_ID"+currentStation);

	int i=0;
	
	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	int SizeOfPaths=sv_sp.GetNamedTagAsInt("sv_paths_number^"+sign_id,-1);

	while(i<SizeOfPaths)
		{
		if( !DeleteLongAltPaths(ST_name, sign_id, i) )
			i++;
		if(i % 10 == 0)
			Sleep(0.01);
		}


	}



thread void DeletePathStation(int station)
	{
	Path_delete_init = true;



	string ST_name = StationProperties.GetNamedTag("station_name_by_ID"+currentStation);
	int svetof_numb=StationProperties.GetNamedTagAsInt(ST_name+".svetof_number",0);
	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");

	int j;

	for(j=0;j<svetof_numb;j++)
		{
		int i=0;
		int SizeOfPaths=sv_sp.GetNamedTagAsInt("sv_paths_number^"+j,-1);


		part_of_st=" "+(string)(j*100/svetof_numb)+"%";



		while(i<SizeOfPaths)
			{
			if( !DeleteLongAltPaths(ST_name, j, i) )
				i++;
			if(i % 10 == 0)
				{
				PostMessage(me,"Refresh","now",0.05);
				Sleep(0.01);
				}
			}
		}
	part_of_st= "";

	Path_delete_init = false;


	PostMessage(me,"Refresh","stop",0.0);
	}








public void  SetPropertyValue2 (string propertyID, int value) 
{
string[] tookens=Str.Tokens(propertyID,"^");
if(tookens[0]=="svetofor_m")
	{
	int i=currentSignalId;
	int i2=Str.ToInt(tookens[2]);


	Soup sp1=Constructors.NewSoup();
	Soup sp2=Constructors.NewSoup();

	string sp_name=StationProperties.GetNamedTag("station_name_by_ID"+currentStation)+".svetof_soup";

	
	sp1.Copy(StationProperties.GetNamedSoup(sp_name));

	string sv_1name="sv_^"+i+"^"+i2;

	sp2.Copy(sp1.GetNamedSoup(sv_1name));
	sp2.SetNamedTag("object_priority",value);

	sp1.SetNamedSoup(sv_1name,sp2);

	StationProperties.SetNamedSoup(sp_name,sp1);
	}
}



void  SetPropertyValue (string propertyID, int value) 
{
	SetPropertyValue2 (propertyID,value);
}






public string   GetPropertyValue  ( string propertyID) 
{
	
string[] tookens=Str.Tokens(propertyID,"^");
if(tookens[0]=="svetofor_m")
	{
	int i=currentSignalId;
	int i2=Str.ToInt(tookens[2]);

	string sp_name=StationProperties.GetNamedTag("station_name_by_ID"+currentStation)+".svetof_soup";

	return StationProperties.GetNamedSoup(sp_name).GetNamedSoup("sv_^"+i+"^"+i2).GetNamedTag("object_priority");

	}
return "";
}




public string GetContentViewDetails(void)
{
 	string s="";
 	HTMLWindow hw=HTMLWindow;


	if(!Br_mode)
		{

		if(currentStation<0 or !StationProperties)
			return s;


	
		string Sname=StationProperties.GetNamedTag("station_name_by_ID"+currentStation);
		
		int i, num=StationProperties.GetNamedTagAsInt(Sname+".svetof_number",0);
		Soup S_element=StationProperties.GetNamedSoup(Sname+".svetof_soup");


		if(!S_element)
			return s;


		s=s+ST1.GetString("station") +Sname +"<br><br> ";

		for(i=0;i<num;i++)
			{
			s=s+ S_element.GetNamedTag("sv^"+i)+" '"+ S_element.GetNamedTag("sv_n^"+i) +"'<br>";
			}
		}
	else
		{
		s = junct_err_string;
		
		}


	s = "<html><body>"+s+"</body></html>";

	return s;


}


thread void ShowBrowser(void)
{
	Message msg;
 	while (mn)
        	{
        	wait()
			{
			on "Browser-URL","",msg: 
				{
			        continue;
                        	}
                	on "Browser-Closed","",msg: 
				if(msg.src==mn)
					mn=null;
                	}
        	}
        mn=null;
}

void MainShowSignals()
{
	if(!mn)
		{
		mn=Constructors.NewBrowser();
		ShowBrowser();
		}

        
        mn.LoadHTMLString(GetAsset(),GetContentViewDetails());
        int x=Math.Rand(0,20);
        int y=Math.Rand(0,20);


	
	if(!Br_mode)
	        mn.SetWindowRect(100+x,100+y,500+x,250+y);
	else
	        mn.SetWindowRect(100+x,100+y,700+x,250+y);
        
 }


void RefreshBrowser()
{
 	if(mn)
		mn.LoadHTMLString(GetAsset(),GetContentViewDetails());
}



public void LinkPropertyValue2(string propertyID)
        {
        if(propertyID == "seachforjunctions")
        	{
		if(reset_jun)
			{
			int i;
			int N=BSJunctionLib.N;
			int dir1;
			for(i=0;i<N;i++)
				{
				dir1 =(cast<JuctionWithProperties>(BSJunctionLib.DBSE[i].Object)).OldDirection;
				(cast<Junction>Router.GetGameObject(BSJunctionLib.DBSE[i].a)).SetDirection(dir1);	
				}


			reset_jun = false;
			}
		InitJunctions_All();
           	}
	else if(propertyID == "err_junctions")
		{
		Br_mode = true;
		MainShowSignals();
		}
	else if(propertyID == "station_browser")
		{
		Br_mode = false;
		MainShowSignals();
		}
        else if(propertyID == "initsignas")
        	{
		InitSignals_All();
		}

	else
		{
		string[] tookens=Str.Tokens(propertyID,"^");
		if(tookens[0]=="station_p")
			{
			currentStation=Str.ToInt(tookens[1]);
			RefreshBrowser();
			}
		if(tookens[0]=="station_init")
			{
			currentStation=Str.ToInt(tookens[1]);
			InitStation(currentStation);
			}

		if(tookens[0]=="station_d")
			{
			currentStation=Str.ToInt(tookens[1]);
			DeletePathStation(currentStation);
			}
		if(tookens[0]=="svetofor+p")	
			{
			currentSignalId=Str.ToInt(tookens[1]);
			MakeAllPathsFromSignal(currentStation,currentSignalId);
			}
		if(tookens[0]=="svetofor_p")	
			{
			currentSignalId=Str.ToInt(tookens[1]);
			}
		if(tookens[0]=="svetofor_d")
			{
			currentSignalId=Str.ToInt(tookens[1]);
			DeletePathSignal(currentStation,currentSignalId);
			}
		if(tookens[0]=="svetofor_x")
			{
			int i=currentSignalId;
			int i2=Str.ToInt(tookens[2]);


			Soup sp1=Constructors.NewSoup();
			Soup sp2=Constructors.NewSoup();

			string sp_name=StationProperties.GetNamedTag("station_name_by_ID"+currentStation)+".svetof_soup";

			sp1.Copy(StationProperties.GetNamedSoup(sp_name));

			int j;
			string sv_1name;
			int path_number=sp1.GetNamedTagAsInt("sv_paths_number^"+i);

			sp1.SetNamedTag("sv_paths_number^"+i,path_number-1);

			for(j=i2;j<path_number-1;j++)
				{
				sp2.Clear();
				sv_1name="sv_^"+i+"^"+(j+1);
				sp2.Copy(sp1.GetNamedSoup(sv_1name));
				
				sv_1name="sv_^"+i+"^"+j;

				sp1.SetNamedSoup(sv_1name,sp2);
				}
			sp1.RemoveNamedTag("sv_^"+i+"^"+(path_number-1));			

			StationProperties.SetNamedSoup(sp_name,sp1);
			}
		}



	
        }

void LinkPropertyValue(string propertyID)
{

LinkPropertyValue2(propertyID);
inherited(propertyID);
}

public Soup GetProperties(void)
	{
	Soup retSoup = inherited();

	if(IsInited and !cache2.IsLocked())
		{
		retSoup.SetNamedSoup("my_soup1",ToSoupJL());
		}

	if(IsInited2 and !StationProperties.IsLocked())
		retSoup.SetNamedSoup("my_Signals1",StationProperties);

	retSoup.SetNamedSoup("my_Paths1",ToSoupPaths());


	retSoup.SetNamedTag("my_CurrentPath",CurrentPath);

	retSoup.SetNamedTag("reset_jun",reset_jun);

     
	return retSoup;
	}


thread void Initing1(Soup soup)
	{
	Sleep(0.1);

	if(!IsInited)
		{
		cache2=Constructors.NewSoup();
		cache2.Copy(soup.GetNamedSoup("my_soup1"));	
		FromSoupJL(cache2);
		}
	
	}


public void SetProperties(Soup soup)
	{
	inherited(soup);

	Initing1(soup);

	if(!IsInited2)
		{
		StationProperties.Copy(soup.GetNamedSoup("my_Signals1"));
		if(StationProperties.GetNamedTagAsInt("st_Number",-1)>=0)
			{
			Calculated2=ST1.GetString("alrady_finished");
			IsInited2=true;


			currentStation=0;
			currentSignalId=0;
			}
		}
	FromSoupPaths(soup.GetNamedSoup("my_Paths1"));
	CurrentPath=soup.GetNamedTagAsInt("my_CurrentPath",2);

	reset_jun = soup.GetNamedTagAsBool("reset_jun",false);
	}



thread void BrowserRefresher(Browser browser)
	{
	Is_refresh = true;

	PostMessage(me,"Refresh","stop2",0.1);

	wait()
		{
		on "Refresh","now":
			{
			string html = GetDescriptionHTML();

			browser.LoadHTMLString(browser.GetAsset(), html);

			continue;
			}

		on "Refresh","stop":
			{
			string html = GetDescriptionHTML();

			browser.LoadHTMLString(browser.GetAsset(), html);

			if (m_propertyObjectHandler)
				m_propertyObjectHandler.RefreshBrowser(browser);

			if( Junct_init or Sign_init or Path_init or Path_delete_init )
				continue;

			}

		on "Refresh","stop2":
			{
			if( Junct_init or Sign_init or Path_init or Path_delete_init )
				continue;

			}

		}


	Is_refresh = false;

	}




public void PropertyBrowserRefresh(Browser browser)
	{
	inherited(browser);

	if(!Is_refresh )
		BrowserRefresher(browser);	
	}




public void  Init (Asset asset)
	{
	inherited(asset);

	BSJunctionLib= new BinarySortedArrayS();
	StationProperties= Constructors.NewSoup();
	PathLib= new BinarySortedArrayS2();
			
	AddHandler(me,"TJunction_Path_source","Find_Junction_Path_base","AnsweringHander");


	InitPathCleaner();
	

	ST1= GetAsset().GetStringTable();
	Calculated=ST1.GetString("not_yet");
	Calculated2=ST1.GetString("not_yet");
  	}


};