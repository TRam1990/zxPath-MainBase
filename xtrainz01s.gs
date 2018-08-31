include "gs.gs"

include "Interface.gs"


class BinarySortedElementS
	{
	public string a; 		// ������
	public GSObject Object; 	// ������
	};

class BinarySortedArrayS
	{
	public BinarySortedElementS[] DBSE=new BinarySortedElementS[0];	// �������� ������ ���������

	public int N=0;			// ����� ������������������ ���������

	


	public void UdgradeArraySize(int NewN )			// ������ ���������������� ��������� ����� �������
		{
		int i;
		BinarySortedElementS[] DBSE2= new BinarySortedElementS[NewN];

		for(i=0;i<N;i++)			// ������������� ������ ������
			DBSE2[i]=DBSE[i];

		for(i=N;i<NewN;i++)
			DBSE2[i]=new BinarySortedElementS();
				
		DBSE=DBSE2; 
		}

	


	bool Comp_str_FL(string a,string b)
		{
		if(a.size()>b.size())
			return false;
		if(a.size()<b.size())
			return true;

		int i=a.size()-1;

		while(i>=0)
			{
			if(a[i]>b[i])
				return false;
			if(a[i]<b[i])
				return true;
			--i;
			}


		return false;
		}


	public int Find(string a, bool mode) // ��� mode = true ��������� �����, ��� ��� �� ���������� ����� ������� 
		{
		int i=0,f=0,b=N-1;
		if(N>0)
			{
			//Interface.Log(a);

			if(a == DBSE[f].a)
				return f;
			if(DBSE[b].a == a)
				return b;

			if(Comp_str_FL(a,DBSE[f].a))
				{
				if(mode)
					return 0;
				else
					return -1;
				}
			if(Comp_str_FL(DBSE[b].a,a))
				{
				if(mode)
					return N;
				else
					return -1;
				}
			
			while(b>(f+1))
				{
				i=f + (int)((b-f)/2);				// �������� �������

				if(DBSE[i].a==a)
					return i;

				if( Comp_str_FL(DBSE[f].a,a) and Comp_str_FL(a,DBSE[i].a))	// �� ������� �� f �� i
					b=i;
				if( Comp_str_FL(DBSE[i].a,a) and Comp_str_FL(a,DBSE[b].a))	// �� ������� �� i �� b
					f=i;
				}

			if(DBSE[f+1].a==a or (mode and Comp_str_FL(DBSE[f].a,a) and Comp_str_FL(a,DBSE[f+1].a)))
				return f+1;

			if(mode and Comp_str_FL(DBSE[f+1].a,a) and Comp_str_FL(a,DBSE[f+2].a))
				return f+2;
			}
		
		if(mode)
			return i;
		return -1;					// �� ������
		}


	
	public bool AddElement(string Name, GSObject NObject)
		{
				
		if(N==0)
			{
			N=1;
			DBSE[0]=new BinarySortedElementS();
			DBSE[0].a=Name;
			DBSE[0].Object=NObject;
			return true;
			}
		else
			{

			//string a1311="insert "+Name+" first "+DBSE[0].a+" last "+DBSE[N-1].a;
			//Interface.Log(a1311);

			int t = Find(Name,true);

			//a1311="pos = "+t+" N = "+N;			
			//Interface.Log(a1311);

			if(t<=N and t>=0)
				{
				int i;
				for(i=N-1;i>=t;i--)
					{
					DBSE[i+1].a=DBSE[i].a;
					DBSE[i+1].Object=DBSE[i].Object;
					}
				DBSE[t].a=Name;
				DBSE[t].Object=NObject;
				N++;

				return true;
				}
			}	
		return false;		
		}

	public void DeleteElement(string a)
		{
		int t = Find(a,false);
		if(t>=0)
			{
			int i;
			for(i=t;i<N-1;i++)
				{
				DBSE[i].a=DBSE[i+1].a;
				DBSE[i].Object=DBSE[i+1].Object;
				}
			N--;
			}	
		}

	public void DeleteElementByNmb(int a)
		{
		
		if(a>=0)
			{
			int i;
			for(i=a;i<N-1;i++)
				{
				DBSE[i].a=DBSE[i+1].a;
				DBSE[i].Object=DBSE[i+1].Object;
				}
			N--;
			}	
		}



	};





class BinarySortedArrayS2
	{
	public BinarySortedElementS[] DBSE=new BinarySortedElementS[0];	// �������� ������ ���������

	public int N=0;			// ����� ������������������ ���������

	


	public void UdgradeArraySize(int NewN )			// ������ ���������������� ��������� ����� �������
		{
		int i;
		BinarySortedElementS[] DBSE2= new BinarySortedElementS[NewN];

		for(i=0;i<N;i++)			// ������������� ������ ������
			DBSE2[i]=DBSE[i];

		for(i=N;i<NewN;i++)
			DBSE2[i]=new BinarySortedElementS();
				
		DBSE=DBSE2; 
		}

	


	bool Comp_str_FL(string a,string b)
		{
		if(a.size()>b.size())
			return false;
		if(a.size()<b.size())
			return true;

		int i=0;

		while(i<a.size())
			{
			if(a[i]>b[i])
				return false;
			if(a[i]<b[i])
				return true;
			++i;
			}


		return false;
		}


	public int Find(string a, bool mode) // ��� mode = true ��������� �����, ��� ��� �� ���������� ����� ������� 
		{
		int i=0,f=0,b=N-1;
		if(N>0)
			{
			//Interface.Log(a);

			if(a == DBSE[f].a)
				return f;
			if(DBSE[b].a == a)
				return b;

			if(Comp_str_FL(a,DBSE[f].a))
				{
				if(mode)
					return 0;
				else
					return -1;
				}
			if(Comp_str_FL(DBSE[b].a,a))
				{
				if(mode)
					return N;
				else
					return -1;
				}
			
			while(b>(f+1))
				{
				i=f + (int)((b-f)/2);				// �������� �������

				if(DBSE[i].a==a)
					return i;

				if( Comp_str_FL(DBSE[f].a,a) and Comp_str_FL(a,DBSE[i].a))	// �� ������� �� f �� i
					b=i;
				if( Comp_str_FL(DBSE[i].a,a) and Comp_str_FL(a,DBSE[b].a))	// �� ������� �� i �� b
					f=i;
				}

			if(DBSE[f+1].a==a or (mode and Comp_str_FL(DBSE[f].a,a) and Comp_str_FL(a,DBSE[f+1].a)))
				return f+1;

			if(mode and Comp_str_FL(DBSE[f+1].a,a) and Comp_str_FL(a,DBSE[f+2].a))
				return f+2;
			}
		
		if(mode)
			return i;
		return -1;					// �� ������
		}


	
	public bool AddElement(string Name, GSObject NObject)
		{
				
		if(N==0)
			{
			N=1;
			DBSE[0]=new BinarySortedElementS();
			DBSE[0].a=Name;
			DBSE[0].Object=NObject;
			return true;
			}
		else
			{

			//string a1311="insert "+Name+" first "+DBSE[0].a+" last "+DBSE[N-1].a;
			//Interface.Log(a1311);

			int t = Find(Name,true);

			//a1311="pos = "+t+" N = "+N;			
			//Interface.Log(a1311);

			if(t<=N and t>=0)
				{
				int i;
				for(i=N-1;i>=t;i--)
					{
					DBSE[i+1].a=DBSE[i].a;
					DBSE[i+1].Object=DBSE[i].Object;
					}
				DBSE[t].a=Name;
				DBSE[t].Object=NObject;
				N++;

				return true;
				}
			}	
		return false;		
		}

	public void DeleteElement(string a)
		{
		int t = Find(a,false);
		if(t>=0)
			{
			int i;
			for(i=t;i<N-1;i++)
				{
				DBSE[i].a=DBSE[i+1].a;
				DBSE[i].Object=DBSE[i+1].Object;
				}
			N--;
			}	
		}

	public void DeleteElementByNmb(int a)
		{
		
		if(a>=0)
			{
			int i;
			for(i=a;i<N-1;i++)
				{
				DBSE[i].a=DBSE[i+1].a;
				DBSE[i].Object=DBSE[i+1].Object;
				}
			N--;
			}	
		}



	};